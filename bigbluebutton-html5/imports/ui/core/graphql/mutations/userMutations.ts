import { gql } from '@apollo/client';

export const SET_CAMERA_PINNED = gql`
  mutation SetCameraPinned($userId: String!, $pinned: Boolean!) {
    userSetCameraPinned(
      userId: $userId,
      pinned: $pinned,
    )
  }
`;

export const SET_RAISE_HAND = gql`
  mutation SetRaiseHand($userId: String!, $raiseHand: Boolean!) {
    userSetRaiseHand(
      userId: $userId,
      raiseHand: $raiseHand,
    )
  }
`;

export const EJECT_FROM_MEETING = gql`
  mutation EjectFromMeeting($userId: String!, $banUser: Boolean!) {
    userEjectFromMeeting(
      userId: $userId,
      banUser: $banUser,
    )
  }
`;

export const EJECT_FROM_VOICE = gql`
  mutation EjectFromVoice($userId: String!, $banUser: Boolean!) {
    userEjectFromVoice(
      userId: $userId,
      banUser: $banUser,
    )
  }
`;

export const SET_PRESENTER = gql`
  mutation SetPresenter($userId: String!) {
    userSetPresenter(
      userId: $userId,
    )
  }
`;

export const SET_REACTION_EMOJI = gql`
  mutation SetReactionEmoji($reactionEmoji: String!) {
    userSetReactionEmoji(
      reactionEmoji: $reactionEmoji,
    )
  }
`;

export const SET_LOCKED = gql`
  mutation SetUserLocked($userId: String!, $locked: Boolean!) {
    userSetLocked(
      userId: $userId,
      locked: $locked,
    )
  }
`;

export const CLEAR_ALL_REACTION = gql`
  mutation ClearAllUsersReaction {
    allUsersClearReaction
  }
`;

export const SET_EXIT_REASON = gql`
  mutation SetExitReason($exitReason: String!) {
    userSetExitReason(
      exitReason: $exitReason,
    )
  }
`;

export const SET_SPEECH_LOCALE = gql`
  mutation SetSpeechLocale($locale: String!, $provider: String!) {
    userSetSpeechLocale(
      locale: $locale,
      provider: $provider,
    )
  }
`;

export const SET_CAPTION_LOCALE = gql`
  mutation SetCaptionLocale($locale: String!, $provider: String!) {
    userSetCaptionLocale(
      locale: $locale,
      provider: $provider,
    )
  }
`;

export const USER_LEAVE_MEETING = gql`
  mutation UserLeaveMeeting {
    userLeaveMeeting
  }
`;

export const SET_USER_CHAT_LOCKED = gql`
  mutation UserSetChatLocked($disablePubChat: Boolean!, $userId: String!) {
    userSetUserLockSettings(
      userId: $userId,
      disablePubChat: $disablePubChat,
    )
  }
`;

export const SWAP_SCREENSHARE = gql`
  mutation($screenshareAsContent: Boolean!) {
   meetingLayoutSetScreenshareAsContent(screenshareAsContent: $screenshareAsContent)
  }
`;

export default {
  SET_CAMERA_PINNED,
  SET_RAISE_HAND,
  EJECT_FROM_MEETING,
  EJECT_FROM_VOICE,
  SET_PRESENTER,
  SET_REACTION_EMOJI,
  SET_LOCKED,
  CLEAR_ALL_REACTION,
  SET_EXIT_REASON,
  SET_SPEECH_LOCALE,
  USER_LEAVE_MEETING,
  SET_USER_CHAT_LOCKED,
};
