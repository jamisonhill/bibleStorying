// Send Feedback: a small form for reporting a problem with the app or
// suggesting an idea. Reports go to the app's developer (not the Bible
// Storying Kenya team — that's "Contact Us"). No email field, so the
// App Store privacy label stays "Data Not Collected".

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChoiceChips, type ChipOption } from '@/components/choice-chips';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { sendFeedback, type FeedbackLevel, type FeedbackType } from '@/lib/feedback';

const TYPE_OPTIONS: ChipOption<FeedbackType>[] = [
  { value: 'bug', label: 'Problem' },
  { value: 'feature', label: 'Idea' },
];

// The service accepts 'critical' for bugs only.
const BUG_LEVELS: ChipOption<FeedbackLevel>[] = [
  { value: 'low', label: 'Minor' },
  { value: 'medium', label: 'Annoying' },
  { value: 'high', label: 'Serious' },
  { value: 'critical', label: 'App unusable' },
];
const FEATURE_LEVELS: ChipOption<FeedbackLevel>[] = [
  { value: 'low', label: 'Nice to have' },
  { value: 'medium', label: 'Helpful' },
  { value: 'high', label: 'Important' },
];

// Service limits: 5 to 2000 characters.
const MIN_LENGTH = 5;
const MAX_LENGTH = 2000;

export default function FeedbackScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<FeedbackType>('bug');
  const [level, setLevel] = useState<FeedbackLevel>('medium');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  // After a send: a confirmation (done) or the service's reason (error).
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmed = description.trim();
  const canSend = trimmed.length >= MIN_LENGTH && !sending;

  const changeType = (next: FeedbackType) => {
    setType(next);
    // 'critical' isn't valid for an idea; fall back to the middle level.
    if (next === 'feature' && level === 'critical') setLevel('medium');
  };

  const submit = async () => {
    setSending(true);
    setError(null);
    const result = await sendFeedback({ type, level, description: trimmed });
    setSending(false);
    switch (result.status) {
      case 'sent':
        setDone('Thank you. Your report was sent.');
        break;
      case 'queued':
        setDone('You seem to be offline. Your report is saved and will be sent the next time the app opens with a connection.');
        break;
      case 'rejected':
        setError(result.message);
        break;
    }
  };

  if (done) {
    return (
      <View style={[styles.doneWrap, { backgroundColor: theme.background }]}>
        <Text style={[styles.doneText, { color: theme.text }]}>{done}</Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={[styles.buttonText, { color: theme.textOnAccent }]}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Found something wrong with the app, or have an idea to make it better? This goes to the
          app’s developer.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>TYPE</Text>
        <ChoiceChips options={TYPE_OPTIONS} selected={type} onSelect={changeType} />

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {type === 'bug' ? 'HOW BAD IS IT?' : 'HOW IMPORTANT?'}
        </Text>
        <ChoiceChips
          options={type === 'bug' ? BUG_LEVELS : FEATURE_LEVELS}
          selected={level}
          onSelect={setLevel}
        />

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {type === 'bug' ? 'WHAT HAPPENED?' : 'WHAT WOULD YOU LIKE?'}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={MAX_LENGTH}
          placeholder={
            type === 'bug'
              ? 'Describe the problem and what you were doing when it happened.'
              : 'Describe your idea.'
          }
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel="Description"
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
          textAlignVertical="top"
        />

        {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}

        <Pressable
          onPress={submit}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSend }}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.accent, opacity: !canSend ? 0.4 : pressed ? 0.8 : 1 },
          ]}
        >
          {sending ? (
            <ActivityIndicator color={theme.textOnAccent} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.textOnAccent }]}>Send</Text>
          )}
        </Pressable>

        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Your app version and phone model are included to help fix problems. No personal
          information is sent.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12 },
  intro: { fontSize: 15, lineHeight: 21 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: radius.card,
    minHeight: 140,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    lineHeight: 22,
  },
  error: { fontSize: 14, lineHeight: 20, marginTop: 12 },
  button: {
    borderRadius: radius.pill,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  note: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 16 },
  doneWrap: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
  doneText: { fontSize: 17, lineHeight: 24, textAlign: 'center' },
});
