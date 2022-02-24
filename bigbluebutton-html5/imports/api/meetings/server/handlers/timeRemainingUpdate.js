import { check } from 'meteor/check';
import Meetings, { MeetingTimeRemaining } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import addSystemMsg from '/imports/api/group-chat-msg/server/modifiers/addSystemMsg';

export default function handleTimeRemainingUpdate({ body }, meetingId) {
  check(meetingId, String);

  check(body, {
    timeLeftInSec: Number,
    timeUpdatedInMinutes: Number,
  });
  const { timeLeftInSec, timeUpdatedInMinutes } = body;

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      timeRemaining: timeLeftInSec,
    },
  };

  try {
    MeetingTimeRemaining.upsert(selector, modifier);
  } catch (err) {
    Logger.error(`Changing recording time: ${err}`);
  }

  if (timeUpdatedInMinutes > 0) {
    const Meeting = Meetings.findOne({ meetingId });

    if (Meeting.meetingProp.isBreakout) {
      const CHAT_CONFIG = Meteor.settings.public.chat;
      const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
      const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
      const PUBLIC_CHAT_INFO = CHAT_CONFIG.system_messages_keys.chat_info;
      const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

      const messageValues = {
        0: timeUpdatedInMinutes,
      };

      const payload = {
        id: `${SYSTEM_CHAT_TYPE}-${PUBLIC_CHAT_INFO}`,
        timestamp: Date.now(),
        correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
        sender: {
          id: PUBLIC_CHAT_SYSTEM_ID,
          name: '',
        },
        message: 'breakoutDurationUpdated',
        messageValues,
      };

      addSystemMsg(meetingId, PUBLIC_GROUP_CHAT_ID, payload);
    }
  }
}
