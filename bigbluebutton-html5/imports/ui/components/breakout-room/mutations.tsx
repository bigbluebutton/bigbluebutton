import { gql } from '@apollo/client';

export const BREAKOUT_ROOM_CREATE = gql`
  mutation BreakoutRoomCreate(
    $record: Boolean!,
    $captureNotes: Boolean!,
    $captureSlides: Boolean!,
    $durationInMinutes: Int!,
    $sendInviteToModerators: Boolean!,
    $rooms: [BreakoutRoom]!,
  ) {
    breakoutRoomCreate(
      record: $record,
      captureNotes: $captureNotes,
      captureSlides: $captureSlides,
      durationInMinutes: $durationInMinutes,
      sendInviteToModerators: $sendInviteToModerators,
      rooms: $rooms,
    )
  }
`;

export const BREAKOUT_ROOM_END_ALL = gql`
  mutation {
    breakoutRoomEndAll
  }
`;

export const BREAKOUT_ROOM_MOVE_USER = gql`
  mutation BreakoutRoomMoveUser(
    $userId: String!,
    $fromBreakoutRoomId: String!,
    $toBreakoutRoomId: String!,
  ) {
    breakoutRoomMoveUser(
      userId: $userId,
      fromBreakoutRoomId: $fromBreakoutRoomId,
      toBreakoutRoomId: $toBreakoutRoomId,
    )
  }
`;

export const BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL = gql`
  mutation BreakoutRoomSendMessageToAll($message: String!) {
    breakoutRoomSendMessageToAll(
      message: $message,
    )
  }
`;

export const BREAKOUT_ROOM_SET_TIME = gql`
  mutation BreakoutRoomSetTime($timeInMinutes: Int!) {
    breakoutRoomSetTime(
      timeInMinutes: $timeInMinutes,
    )
  }
`;

export const USER_TRANSFER_VOICE_TO_MEETING = gql`
  mutation UserTransferVoiceToMeeting($fromMeetingId: String!, $toMeetingId: String!) {
    userTransferVoiceToMeeting(
      fromMeetingId: $fromMeetingId,
      toMeetingId: $toMeetingId,
    )
  }
`;

export const BREAKOUT_ROOM_REQUEST_JOIN_URL = gql`
  mutation BreakoutRoomRequestJoinUrl($breakoutRoomId: String!) {
    breakoutRoomRequestJoinUrl(
      breakoutRoomId: $breakoutRoomId,
    )
  }
`;

export default {
  BREAKOUT_ROOM_CREATE,
  BREAKOUT_ROOM_END_ALL,
  BREAKOUT_ROOM_MOVE_USER,
  BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL,
  BREAKOUT_ROOM_SET_TIME,
  USER_TRANSFER_VOICE_TO_MEETING,
  BREAKOUT_ROOM_REQUEST_JOIN_URL,
};
