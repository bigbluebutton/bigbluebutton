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
    const users = Users.find({
      meetingId: meetingId,
    }, {
      fields: {
        'user.userid': 1,
        _id: 0,
      },
    }).fetch();

    addPoll(poll, requesterId, users, meetingId);
  }
}
