import { check } from 'meteor/check';
import setPresenterInPod from '../modifiers/setPresenterInPod';

export default function handleSetPresenterInPod({ body }, meetingId) {
  check(body, Object);

  const { podId, nextPresenterId } = body;

  check(podId, String);
  check(nextPresenterId, String);

  setPresenterInPod(meetingId, podId, nextPresenterId);
}
