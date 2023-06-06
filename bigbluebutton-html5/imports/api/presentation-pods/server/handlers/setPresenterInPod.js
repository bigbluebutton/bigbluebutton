import { check } from 'meteor/check';
import setPresenterInPod from '../modifiers/setPresenterInPod';

export default async function handleSetPresenterInPod({ body }, meetingId) {
  check(body, Object);

  const { podId, nextPresenterId } = body;

  check(podId, String);
  check(nextPresenterId, String);

  await setPresenterInPod(meetingId, podId, nextPresenterId);
}
