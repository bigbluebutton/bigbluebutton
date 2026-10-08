// If the environment variable is undefined, fallback to the default value
export const REDIS_HOST = process.env.BBB_REDIS_HOST || '127.0.0.1';
export const REDIS_PORT = Number(process.env.BBB_REDIS_PORT) || 6379;
export const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1';
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 8093;
export const MAX_BODY_SIZE = Number(process.env.MAX_BODY_SIZE) || 10485760; // 10MB

// Transport-level ceiling for a single caption submission, NOT policy. The
// authoritative per-meeting limit is `public.captions.maxTextLength`, enforced
// in akka-apps. This only keeps absurd payloads out of Redis, so it MUST stay
// >= any configured maxTextLength or it would reject submissions the meeting is
// configured to accept. graphql-actions cannot see that per-meeting setting, so
// keeping the two in step is left to the operator.
const DEFAULT_CAPTION_TEXT_CEILING = 65536; // 64KB

// Accepts only a positive decimal integer; anything else (Infinity, negatives,
// fractions, hex, exponents) falls back to the default.
export const parseCaptionTextCeiling = (raw: string | undefined): number => {
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_CAPTION_TEXT_CEILING;
  }

  const trimmed = raw.trim();
  const value = /^\d+$/.test(trimmed) ? Number(trimmed) : NaN;
  if (Number.isSafeInteger(value) && value > 0) {
    return value;
  }

  console.warn(`Ignoring invalid CAPTION_TEXT_CEILING '${raw}', using ${DEFAULT_CAPTION_TEXT_CEILING}`);
  return DEFAULT_CAPTION_TEXT_CEILING;
};

export const CAPTION_TEXT_CEILING = parseCaptionTextCeiling(process.env.CAPTION_TEXT_CEILING);
export const DEBUG = false;
