import RedisPubSub from '/imports/startup/server/redis';
import setFitToWidth from '../modifiers/setFitToWidth';
import { check } from 'meteor/check';

const POD_ID = 'DEFAULT_PRESENTATION_POD';

export default function setPresentationFitToWidth(credentials, presentationId, fitToWidth) {
  const { meetingId } = credentials;

  check(meetingId, String);
  check(presentationId, String);
  check(fitToWidth, Boolean);

  setFitToWidth(meetingId, POD_ID, presentationId, fitToWidth);
}
