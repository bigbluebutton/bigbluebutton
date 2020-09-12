import { check } from 'meteor/check';
import MeteorSyncConfirmation from '/imports/startup/server/meteorSyncComfirmation';

export default function handleRecordingStatusChange({ body }) {
  check(body, {
    meetings: Array,
  });
  MeteorSyncConfirmation.setPromises(body.meetings);
}
