import { eventEmitter } from '/imports/startup/server';
import { clearPollCollection } from './clearPollCollection';
import { updatePollCollection } from './updatePollCollection';
import { addPollToCollection } from './addPollToCollection';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';

eventEmitter.on('poll_show_result_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;
  if (payload != null && payload.poll != null && payload.poll.id != null && meetingId != null) {
    const pollId = payload.poll.id;
    clearPollCollection(meetingId, pollId);
  }

  return arg.callback();
});

eventEmitter.on('poll_started_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;

  if (payload != null && meetingId != null &&
    payload.requester_id != null && payload.poll != null) {
    if (Meetings.findOne({
        meetingId: meetingId,
      }) != null) {
      const users = Users.find({
        meetingId: meetingId,
      }, {
        fields: {
          'user.userid': 1,
          _id: 0,
        },
      }).fetch();
      addPollToCollection(
        payload.poll,
        payload.requester_id,
        users,
        meetingId
      );
    }
  }

  return arg.callback();
});

eventEmitter.on('poll_stopped_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;

  if (meetingId != null && payload != null && payload.poll_id != null) {
    const pollId = payload.poll_id;
    clearPollCollection(meetingId, pollId);
  }

  return arg.callback();
});

eventEmitter.on('user_voted_poll_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;
  if (payload != null && payload.poll != null && meetingId != null &&
    payload.presenter_id != null) {
    const pollObj = payload.poll;
    const requesterId = payload.presenter_id;
    updatePollCollection(pollObj, meetingId, requesterId);
    return arg.callback();
  }
});
