import { RoomToWithSettings } from './room-managment-state/types';
import { makeCall } from '/imports/ui/services/api';

export const createBreakoutRoom = (
  rooms: RoomToWithSettings[],
  durationInMinutes: number,
  record: boolean = false,
  captureNotes: boolean = false,
  captureSlides: boolean = false,
  sendInviteToModerators: boolean = false,
) => makeCall(
  'createBreakoutRoom',
  rooms,
  durationInMinutes,
  record,
  captureNotes,
  captureSlides,
  sendInviteToModerators,
);

export const moveUser = (
  userId: string,
  fromBreakoutId: number,
  toBreakoutId: number,
) => makeCall('moveUser', fromBreakoutId, toBreakoutId, userId);

export default {
  createBreakoutRoom,
  moveUser,
};
