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
