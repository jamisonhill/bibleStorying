// Open a web address without leaving the app: an in-app browser sheet on
// iOS/Android (Safari View Controller / Custom Tab), which the user dismisses
// to land right back where they were. Falls back to the system browser if the
// sheet cannot open (unsupported platform, or a URL scheme Safari refuses).

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

export async function openInAppBrowser(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    // Offline shows the browser's own error page; this catch is only for a
    // sheet that could not be presented at all.
    await Linking.openURL(url).catch(() => {
      // Nothing sensible left to do — the user simply stays on the screen.
    });
  }
}
