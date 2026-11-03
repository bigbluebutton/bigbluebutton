import { gql } from '@apollo/client';

export const SET_ROOM_MODE = gql`
  mutation SetRoomMode($roomMode: String!) {
    meetingSetRoomMode(roomMode: $roomMode)
  }
`;

export default { SET_ROOM_MODE };
