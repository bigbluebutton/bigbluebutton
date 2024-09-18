import changeUserChatLock from '../modifiers/changeUserChatLock';

export default async function handleUserChatLockChange({ body }, meetingId) {
  await changeUserChatLock(meetingId, body);
}
