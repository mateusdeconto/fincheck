import Anthropic from '@anthropic-ai/sdk';

let client = null;

export function getAnthropic() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

export function isOverloadError(err) {
  if (!err) return false;
  if (err.status === 529) return true;
  if (err.error?.type === 'overloaded_error') return true;
  const msg = (err.message || '').toLowerCase();
  return msg.includes('overload') || msg.includes('sobrecarregad');
}

export function isRateLimitError(err) {
  return err?.status === 429;
}
