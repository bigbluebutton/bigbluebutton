import { RemoteParticipant, Track } from 'livekit-client';

type AudioTrackPriorityData = {
  participantId: string;
  trackSid: string;
  source: Track.Source;
  isActiveSpeaker: boolean;
  isUnmuted: boolean;
  lastSpokeAt?: number;
};

export const isAudioSource = (source: Track.Source): boolean => (
  source === Track.Source.Microphone || source === Track.Source.ScreenShareAudio
);

/**
 * Maps a LiveKit participant to the BBB user intId.
 * Mirrors bbb-webrtc-sfu's lkIdToBbbId: web participants are keyed by their
 * LiveKit identity, which WE specify and have control over; dial-in/voice-only
 * participants are keyed by "v_<sid>" since their identities are not controlled
 * by us and sid guarantees a stable-formatted and unique id.
 */
export const getBbbUserIdForParticipant = (participant: RemoteParticipant): string => {
  const { identity, sid } = participant;

  if (identity.startsWith('w_') || identity.startsWith('v_')) return identity;

  return `v_${sid}`;
};

/**
 * Calculate audio track subscription priorities.
 * Sorts by:
 *   1) active speakers
 *   2) unmuted users
 *   3) most recent speakers (even if not active)
 */
const calculateAudioTrackPriorities = (
  remoteParticipants: RemoteParticipant[],
  participantsLastSpokeAt: Map<string, number>,
  unmutedUsers: Record<string, boolean>,
): AudioTrackPriorityData[] => {
  const priorities: AudioTrackPriorityData[] = [];

  remoteParticipants.forEach((participant) => {
    const participantId = participant.identity;
    const lastSpokeAt = participantsLastSpokeAt.get(participantId);
    const isActiveSpeaker = participant.isSpeaking;
    const isUnmuted = unmutedUsers[participantId] ?? false;

    participant.audioTrackPublications.forEach((publication) => {
      if (!isAudioSource(publication.source)) return;

      priorities.push({
        participantId,
        trackSid: publication.trackSid,
        source: publication.source,
        isActiveSpeaker,
        isUnmuted,
        lastSpokeAt,
      });
    });
  });

  priorities.sort((a, b) => {
    // 1) Active speakers
    if (a.isActiveSpeaker !== b.isActiveSpeaker) return a.isActiveSpeaker ? -1 : 1;

    // 2) Unmuted users
    if (a.isUnmuted !== b.isUnmuted) return a.isUnmuted ? -1 : 1;

    // 3) Most recent speakers (even if muted)
    const aLastSpoke = a.lastSpokeAt ?? 0;
    const bLastSpoke = b.lastSpokeAt ?? 0;

    return bLastSpoke - aLastSpoke;
  });

  return priorities;
};

/**
 * Select participants to subscribe to with a priority-based algorithm and maximum
 * subscription pool size.
 * @param remoteParticipants - All remote participants
 * @param participantsLastSpokeAt - A map of participant IDs with their last speaking timestamp
 * @param unmutedUsers - A record of participant IDs with their unmuted state
 * @param poolSize - Maximum subscription pool size (excluding exemptions: screen share audio and unmuted users)
 * @returns A set of participant IDs to subscribe to
 */
export const selectParticipantsToSubscribe = (
  remoteParticipants: RemoteParticipant[],
  participantsLastSpokeAt: Map<string, number>,
  unmutedUsers: Record<string, boolean>,
  poolSize: number,
): Set<string> => {
  const tracks = calculateAudioTrackPriorities(
    remoteParticipants,
    participantsLastSpokeAt,
    unmutedUsers,
  );
  const participants = new Set<string>();

  tracks.forEach((track) => {
    if (poolSize > 0) {
      // Always subscribe to screen share audio and unmuted tracks
      if (track.source === Track.Source.ScreenShareAudio || track.isUnmuted) {
        participants.add(track.participantId);
      } else if (participants.size < poolSize) {
        // Subscribe to at most N tracks - sorted by priority
        participants.add(track.participantId);
      }
    } else {
      // Subscribe to all tracks - last N is disabled
      participants.add(track.participantId);
    }
  });

  return participants;
};

export type LastNCandidate = {
  participantId: string;
  lastSpokeAt?: number;
  unmuted: boolean;
  presenter: boolean;
  pinned: boolean;
  moderator: boolean;
};

export type LastNSettings = {
  audibleSize: number;
  standbySize: number;
  speechHoldMs: number;
  minAudibleMs: number;
  standbyGraceMs: number;
};

export type LastNState = {
  // When each audible participant became audible.
  audibleSince: Map<string, number>;
  // Subscribed participants, mapped to when they ranked out of the standby
  // set (undefined while they rank in).
  standby: Map<string, number | undefined>;
};

export type LastNTiers = {
  audible: Set<string>;
  subscribed: Set<string>;
  state: LastNState;
};

export const createLastNState = (): LastNState => ({
  audibleSince: new Map(),
  standby: new Map(),
});

// Speech outranks every role; presenter and pinned keep a standby slot while
// silent so they become audible without a renegotiation.
const LAST_N_SCORE = {
  speaking: 1000,
  presenter: 400,
  pinned: 300,
  recency: 200,
  moderator: 100,
  unmuted: 50,
  incumbent: 150,
  // Above any sum of the others: a muted microphone carries no audio, so it
  // gets an audible slot only when no unmuted one wants it.
  unmutedAudible: 10000,
};
const LAST_N_RECENCY_SCALE_MS = 10000;

const isLastNSpeaking = (candidate: LastNCandidate, now: number, speechHoldMs: number): boolean => (
  candidate.lastSpokeAt !== undefined && now - candidate.lastSpokeAt <= speechHoldMs
);

const lastNBaseScore = (candidate: LastNCandidate, now: number, speechHoldMs: number): number => {
  let score = 0;

  if (isLastNSpeaking(candidate, now, speechHoldMs)) score += LAST_N_SCORE.speaking;
  if (candidate.presenter) score += LAST_N_SCORE.presenter;
  if (candidate.pinned) score += LAST_N_SCORE.pinned;
  if (candidate.lastSpokeAt !== undefined) {
    score += LAST_N_SCORE.recency * Math.exp(-(now - candidate.lastSpokeAt) / LAST_N_RECENCY_SCALE_MS);
  }
  if (candidate.moderator) score += LAST_N_SCORE.moderator;
  if (candidate.unmuted) score += LAST_N_SCORE.unmuted;

  return score;
};

// Highest score first; ties by identity so that clients fed the same inputs
// pick the same participants.
const rankLastN = (
  candidates: LastNCandidate[],
  scoreOf: (candidate: LastNCandidate) => number,
): LastNCandidate[] => [...candidates].sort((a, b) => {
  const diff = scoreOf(b) - scoreOf(a);

  if (diff !== 0) return diff;
  if (a.participantId === b.participantId) return 0;

  return a.participantId < b.participantId ? -1 : 1;
});

/**
 * When the tiers can next change with no new input: the end of a speech hold,
 * of a minimum audible time or of a standby grace.
 * @param candidates - The candidates selectLastNTiers was called with
 * @param state - The state it returned
 * @param settings - Last-N settings
 * @param now - The time it was called with, in ms
 * @returns The earliest such time in ms, or undefined if none is pending
 */
export const nextLastNDeadline = (
  candidates: LastNCandidate[],
  state: LastNState,
  settings: LastNSettings,
  now: number,
): number | undefined => {
  const deadlines: number[] = [];

  candidates.forEach((candidate) => {
    if (candidate.lastSpokeAt !== undefined && isLastNSpeaking(candidate, now, settings.speechHoldMs)) {
      deadlines.push(candidate.lastSpokeAt + settings.speechHoldMs + 1);
    }
  });
  state.audibleSince.forEach((since) => {
    if (now - since < settings.minAudibleMs) deadlines.push(since + settings.minAudibleMs);
  });
  state.standby.forEach((rankedOutAt) => {
    if (rankedOutAt !== undefined) deadlines.push(rankedOutAt + settings.standbyGraceMs);
  });

  return deadlines.length > 0 ? Math.min(...deadlines) : undefined;
};

/**
 * Splits microphone candidates into the audible set (subscribed and enabled)
 * and the subscribed set (audible plus standby tracks, which stay subscribed
 * but disabled). Everyone else is left unsubscribed.
 * @param candidates - Remote participants eligible to be heard, with a microphone
 * @param previous - The state returned by the previous call
 * @param settings - Last-N settings
 * @param now - Current time in ms
 * @param unboundedStandby - Keep every candidate subscribed (speech of
 *   unsubscribed participants cannot be observed)
 */
export const selectLastNTiers = (
  candidates: LastNCandidate[],
  previous: LastNState,
  settings: LastNSettings,
  now: number,
  unboundedStandby: boolean,
): LastNTiers => {
  const baseScores = new Map(candidates.map((candidate) => [
    candidate.participantId,
    lastNBaseScore(candidate, now, settings.speechHoldMs),
  ]));
  const baseScore = (candidate: LastNCandidate) => baseScores.get(candidate.participantId) ?? 0;
  const audibleSize = Math.max(0, settings.audibleSize);

  const speaking = (candidate: LastNCandidate) => isLastNSpeaking(candidate, now, settings.speechHoldMs);

  // An unmuted audible participant keeps its slot while speaking. A silent one
  // keeps it for minAudibleMs after it got it, but not against an unmuted
  // speaker who needs the slot. A muted one keeps nothing: it carries no audio.
  // The others compete with an incumbent bonus.
  const keptSpeakers = rankLastN(candidates.filter((candidate) => (
    candidate.unmuted && speaking(candidate) && previous.audibleSince.has(candidate.participantId)
  )), baseScore).slice(0, audibleSize);
  const waitingSpeakers = candidates.filter((candidate) => (
    candidate.unmuted && speaking(candidate) && !keptSpeakers.includes(candidate)
  )).length;
  const keptSilent = rankLastN(candidates.filter((candidate) => {
    const since = previous.audibleSince.get(candidate.participantId);

    return candidate.unmuted && !speaking(candidate)
      && since !== undefined && now - since < settings.minAudibleMs;
  }), baseScore).slice(0, Math.max(0, audibleSize - keptSpeakers.length - waitingSpeakers));
  const audible = new Set([...keptSpeakers, ...keptSilent].map((candidate) => candidate.participantId));
  const audibleScore = (candidate: LastNCandidate) => baseScore(candidate)
    + (previous.audibleSince.has(candidate.participantId) ? LAST_N_SCORE.incumbent : 0)
    + (candidate.unmuted ? LAST_N_SCORE.unmutedAudible : 0);

  rankLastN(candidates.filter((candidate) => !audible.has(candidate.participantId)), audibleScore)
    .forEach((candidate) => {
      if (audible.size < audibleSize) audible.add(candidate.participantId);
    });

  const standbySize = unboundedStandby || settings.standbySize <= 0
    ? Infinity
    : Math.max(settings.standbySize, audible.size);
  const standbyScore = (candidate: LastNCandidate) => baseScore(candidate)
    + (previous.standby.has(candidate.participantId) ? LAST_N_SCORE.incumbent : 0);
  const rankedIn = new Set(audible);

  rankLastN(candidates.filter((candidate) => !audible.has(candidate.participantId)), standbyScore)
    .forEach((candidate) => {
      if (rankedIn.size < standbySize) rankedIn.add(candidate.participantId);
    });

  // Leaving standby costs an unsubscribe and, on return, a subscribe: two
  // renegotiations. A participant that ranks out stays subscribed for
  // standbyGraceMs so short dips cost nothing.
  const present = new Set(candidates.map((candidate) => candidate.participantId));
  const standby = new Map<string, number | undefined>();

  rankedIn.forEach((participantId) => standby.set(participantId, undefined));
  previous.standby.forEach((rankedOutAt, participantId) => {
    if (!present.has(participantId) || rankedIn.has(participantId)) return;

    const since = rankedOutAt ?? now;

    if (now - since < settings.standbyGraceMs) standby.set(participantId, since);
  });

  const audibleSince = new Map<string, number>();

  audible.forEach((participantId) => {
    audibleSince.set(participantId, previous.audibleSince.get(participantId) ?? now);
  });

  return {
    audible,
    subscribed: new Set(standby.keys()),
    state: { audibleSince, standby },
  };
};
