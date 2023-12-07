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

export const SET_MOBILE_FLAG = gql`
  mutation SetMobileFlag($mobile: Boolean!) {
    userSetMobileFlag(
      mobile: $mobile,
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

export const SET_EMOJI_STATUS = gql`
  mutation SetEmojiStatus($emoji: String!) {
    userSetEmojiStatus(
      emoji: $emoji,
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

export default {
  SET_CAMERA_PINNED,
  SET_RAISE_HAND,
  SET_MOBILE_FLAG,
  EJECT_FROM_MEETING,
  EJECT_FROM_VOICE,
  SET_PRESENTER,
  SET_EMOJI_STATUS,
  SET_REACTION_EMOJI,
};
