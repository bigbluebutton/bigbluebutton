import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import { check } from 'meteor/check';
import addPoll from '../modifiers/addPoll';

export default function pollStarted({ payload }) {
  check(payload, Object);

  const meetingId = payload.meeting_id;
  const requesterId = payload.requester_id;
  const poll = payload.poll;

  check(meetingId, String);
  check(requesterId, String);
  check(poll, Object);

  const documentExists = Meetings.findOne({
    meetingId: meetingId,
  });

  if (documentExists) {
    const selector = {
      meetingId: meetingId,
    };

    const options = {
      fields: {
        'user.userid': 1,
        _id: 0,
      },
    };

    const users = Users.find(selector, options).fetch();

    return addPoll(poll, requesterId, users, meetingId);
  }
}
