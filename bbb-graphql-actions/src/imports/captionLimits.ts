import { CAPTION_TEXT_CEILING } from '../config';

// See CAPTION_TEXT_CEILING in ../config: transport guard only. akka-apps
// (UpdateTranscriptPubMsgHdlr, CaptionApp2x) enforces the per-meeting
// `public.captions.maxTextLength`, which is the value that decides policy.
export const MAX_TRANSCRIPT_LENGTH = CAPTION_TEXT_CEILING;

// `LocaleUtil.isValidCaptionId` (akka-apps) applies the same 40-char cap;
// akka-apps stores the key as "<userId>-<captionId>" in
// "caption"."captionId" varchar(100).
export const MAX_TRANSCRIPT_ID_LENGTH = 40;
