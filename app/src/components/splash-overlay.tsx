// The branded launch stage: a slate field carrying the site's logo, shown for
// a beat on cold start before the app lands on Home.
//
// Its background is the same #2D3142 as the native launch screen configured in
// app.json, so the handoff from the OS splash to this one is invisible — it
// reads as a single deliberate moment rather than two splashes. The overlay
// unmounts itself when the fade finishes and leaves nothing behind.
//
// Choreography, all on one unchanging slate field:
//   native launch screen (the book glyph)  ──fade out──┐
//   this stage's wordmark                  ──fade in ──┘  the two cross
//   hold, then the whole stage fades away to reveal Home
// The wordmark's entrance is started in the same frame as the native splash is
// told to go, so the book is still on screen as the wordmark arrives — without
// that overlap there is a beat of empty slate between the two marks.

import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, Animated, Easing, StyleSheet, useWindowDimensions,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { BrandLogo } from '@/components/brand-logo';
import { brand } from '@/constants/theme';

const FADE_IN_MS = 400;
const HOLD_MS = 900;
const FADE_OUT_MS = 350;

/**
 * How long the native launch screen takes to dissolve into this one. Kept
 * longer than FADE_IN_MS so the book glyph is still fading while the wordmark
 * rises — the root layout passes this to SplashScreen.setOptions().
 * iOS only: Android hides without a fade, revealing the same slate either way.
 */
export const NATIVE_FADE_MS = 450;

/** How far the logo rises as it fades in. Dropped under Reduce Motion. */
const RISE_DISTANCE = 8;

/** The logo sits at this share of the screen width, never wider than this. */
const LOGO_WIDTH_RATIO = 0.72;
const LOGO_MAX_WIDTH = 320;

export function SplashOverlay() {
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(true);

  // Two values: the logo's own entrance, and the whole stage fading away.
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRise = useRef(new Animated.Value(RISE_DISTANCE)).current;
  const stageOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;

    // Someone who has asked the system for less motion still gets the brand
    // moment — it simply fades, with no travel.
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) logoRise.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: FADE_IN_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(logoRise, {
            toValue: 0,
            duration: reduceMotion ? 0 : FADE_IN_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(HOLD_MS),
        Animated.timing(stageOpacity, {
          toValue: 0,
          duration: FADE_OUT_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        // Only tear down on a clean finish; an interrupted animation leaves
        // the stage up rather than flashing a half-faded overlay away.
        if (finished && !cancelled) setVisible(false);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [logoOpacity, logoRise, stageOpacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.stage, { opacity: stageOpacity }]}
      // Decorative: it must not swallow taps meant for the screen underneath,
      // and VoiceOver should never land inside it.
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      // The native launch screen stays up until this paints, so there is no
      // white frame between the two.
      onLayout={() => {
        void SplashScreen.hideAsync().catch(() => {
          // Already hidden, or hidden by the OS — nothing to recover from.
        });
      }}
    >
      <Animated.View
        style={{ opacity: logoOpacity, transform: [{ translateY: logoRise }] }}
      >
        <BrandLogo
          width={Math.min(width * LOGO_WIDTH_RATIO, LOGO_MAX_WIDTH)}
          ink="#F2F0EC"
          accent={brand.terracotta}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: brand.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
