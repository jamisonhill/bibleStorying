// In-app feedback: sends bug reports and feature requests to the Obed Works
// feedback service (feedback.obedworks.com), which files each one as a task
// in this repo's REPORTS.md. Uses the plain HTTP API — the Swift package and
// web widget don't fit a React Native app.
//
// Offline is normal here, so a report that can't be sent (no connection, or
// the service is briefly down) is saved in the meta table and retried on the
// next launch. A report the service REJECTS (4xx) is not saved: retrying the
// same report would only be rejected again.

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getMeta, setMeta } from '@/lib/db';

const ENDPOINT = 'https://feedback.obedworks.com/api/v1/reports';
// Not a secret: it ships inside the app and can only file reports into this
// one repo. Keeping it in source is deliberate.
const APP_KEY = 'ofk_a78eb651ad88389d2fed603b11dfac83a3238ce82d91644e';
const OUTBOX_KEY = 'feedbackOutbox';
const REQUEST_TIMEOUT_MS = 15_000;

export type FeedbackType = 'bug' | 'feature';
export type FeedbackLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FeedbackDraft {
  type: FeedbackType;
  description: string;
  level?: FeedbackLevel;
  area?: string;
}

/** What happened to a report, for the form to show. */
export type SendResult =
  | { status: 'sent' }
  | { status: 'queued' } // couldn't reach the service; will retry next launch
  | { status: 'rejected'; message: string };

interface Payload extends FeedbackDraft {
  app_version?: string;
  os?: string;
  device?: string;
}

/** Adds the app version, OS and device model the service asks for. */
function withDeviceInfo(draft: FeedbackDraft): Payload {
  const osName = Device.osName ?? Platform.OS;
  const osVersion = Device.osVersion ?? String(Platform.Version);
  return {
    ...draft,
    app_version: Constants.expoConfig?.version?.slice(0, 40),
    os: `${osName} ${osVersion}`.slice(0, 40),
    device: Device.modelName?.slice(0, 60) ?? undefined,
  };
}

/**
 * One POST. 'temporary' means keep the report and try again later
 * (offline, timeout, or a 5xx); 'rejected' carries the service's reason.
 */
async function post(payload: Payload): Promise<'sent' | 'temporary' | { rejected: string }> {
  // Abort a request that hangs on a weak mobile signal instead of leaving
  // the Send button spinning forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Obed-App-Key': APP_KEY },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (response.ok) return 'sent';
    if (response.status >= 500) return 'temporary';
    // 400 / 401 / 429: the body is {"error": "..."}; fall back to a
    // generic message if it isn't readable JSON.
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return { rejected: body?.error ?? `The report was not accepted (error ${response.status}).` };
  } catch {
    // Network failure or timeout — treat as offline.
    return 'temporary';
  } finally {
    clearTimeout(timer);
  }
}

function readOutbox(): Payload[] {
  try {
    const raw = getMeta(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as Payload[]) : [];
  } catch {
    // A corrupt outbox shouldn't break the form; start fresh.
    return [];
  }
}

function writeOutbox(reports: Payload[]): void {
  setMeta(OUTBOX_KEY, JSON.stringify(reports));
}

/** Sends a report now, or saves it to send on a later launch. */
export async function sendFeedback(draft: FeedbackDraft): Promise<SendResult> {
  const payload = withDeviceInfo(draft);
  const outcome = await post(payload);
  if (outcome === 'sent') return { status: 'sent' };
  if (outcome === 'temporary') {
    writeOutbox([...readOutbox(), payload]);
    return { status: 'queued' };
  }
  return { status: 'rejected', message: outcome.rejected };
}

/**
 * Retries saved reports. Called quietly at launch; anything still
 * unreachable stays saved, and anything rejected is dropped.
 */
export async function flushFeedbackOutbox(): Promise<void> {
  const pending = readOutbox();
  if (pending.length === 0) return;
  const stillPending: Payload[] = [];
  for (const payload of pending) {
    if ((await post(payload)) === 'temporary') stillPending.push(payload);
  }
  // Keep anything queued by the form while this loop was running.
  const queuedMeanwhile = readOutbox().slice(pending.length);
  writeOutbox([...stillPending, ...queuedMeanwhile]);
}
