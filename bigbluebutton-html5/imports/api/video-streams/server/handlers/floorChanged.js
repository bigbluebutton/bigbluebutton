import { check } from 'meteor/check';
import floorChanged from '../modifiers/floorChanged';

export default async function handleFloorChanged({ header, body }, meetingId) {
  const { intId, floor, lastFloorTime } = body;
  check(meetingId, String);
  check(intId, String);
  check(floor, Boolean);
  check(lastFloorTime, String);
  const result = await floorChanged(meetingId, intId, floor, lastFloorTime);
  return result;
}
