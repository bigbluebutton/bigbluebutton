import { check } from 'meteor/check';
import setPublishedPoll from '../../../meetings/server/modifiers/setPublishedPoll';
import handleSendSystemChatForPublishedPoll from './sendPollChatMsg';

const POLL_CHAT_MESSAGE = Meteor.settings.public.poll.chatMessage;

export default function pollPublished({ body }, meetingId) {
  const { pollId } = body;

  check(meetingId, String);
  check(pollId, String);

  setPublishedPoll(meetingId, true);

  if (POLL_CHAT_MESSAGE) {
    handleSendSystemChatForPublishedPoll({ body }, meetingId);
  }
}
