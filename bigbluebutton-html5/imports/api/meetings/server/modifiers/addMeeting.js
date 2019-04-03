import flat from 'flat';
import { check, Match } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

const getLockSettings = props => {
  if (props) {
    // Since we miss a name convention here, we need to translate some properties
    // key name to fit the rest of the messaging system
    props = Object.assign(props, {
      disablePrivChat: props.disablePrivateChat,
      disablePubChat: props.disablePublicChat,
      setBy: 'temp',
    });
    delete props['disablePrivateChat'];
    delete props['disablePublicChat'];
  } else {
    // Default lock settings props
    props = {
      disableCam: false,
      disableMic: false,
      disablePrivChat: false,
      disablePubChat: false,
      lockOnJoin: true,
      lockOnJoinConfigurable: false,
      lockedLayout: false,
      setBy: 'temp',
    };
  }
  return props;
};

export default function addMeeting(meeting) {
  const meetingId = meeting.meetingProp.intId;

  check(meetingId, String);
  check(meeting, {
    breakoutProps: {
      sequence: Number,
      freeJoin: Boolean,
      breakoutRooms: Array,
      parentId: String,
    },
    meetingProp: {
      intId: String,
      extId: String,
      isBreakout: Boolean,
      name: String,
    },
    usersProp: {
      webcamsOnlyForModerator: Boolean,
      guestPolicy: String,
      maxUsers: Number,
    },
    durationProps: {
      createdTime: Number,
      duration: Number,
      createdDate: String,
      maxInactivityTimeoutMinutes: Number,
      warnMinutesBeforeMax: Number,
      meetingExpireIfNoUserJoinedInMinutes: Number,
      meetingExpireWhenLastUserLeftInMinutes: Number,
      userInactivityInspectTimerInMinutes: Number,
      userInactivityThresholdInMinutes: Number,
      userActivitySignResponseDelayInMinutes: Number,
      timeRemaining: Number,
    },
    welcomeProp: {
      welcomeMsg: String,
      modOnlyMessage: String,
      welcomeMsgTemplate: String,
    },
    recordProp: Match.ObjectIncluding({
      allowStartStopRecording: Boolean,
      autoStartRecording: Boolean,
      record: Boolean,
    }),
    password: {
      viewerPass: String,
      moderatorPass: String,
    },
    voiceProp: {
      voiceConf: String,
      dialNumber: String,
      telVoice: String,
      muteOnStart: Boolean,
    },
    screenshareProps: {
      red5ScreenshareIp: String,
      red5ScreenshareApp: String,
      screenshareConf: String,
    },
    metadataProp: Object,
    lockSettingsProps: Match.Any,
  });

  const newMeeting = meeting;

  const selector = {
    meetingId,
  };

  newMeeting.lockSettingsProps = getLockSettings(meeting.lockSettingsProps);

  newMeeting.welcomeProp.welcomeMsg = newMeeting.welcomeProp.welcomeMsg.replace(
    'href="event:',
    'href="',
  );

  const insertBlankTarget = (s, i) => `${s.substr(0, i)} target="_blank"${s.substr(i)}`;
  const linkWithoutTarget = new RegExp('<a href="(.*?)">', 'g');
  linkWithoutTarget.test(newMeeting.welcomeProp.welcomeMsg);

  if (linkWithoutTarget.lastIndex > 0) {
    newMeeting.welcomeProp.welcomeMsg = insertBlankTarget(
      newMeeting.welcomeProp.welcomeMsg,
      linkWithoutTarget.lastIndex - 1,
    );
  }

  const modifier = {
    $set: Object.assign(
      { meetingId },
      flat(newMeeting, { safe: true }),
    ),
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Adding meeting to collection: ${err}`);
      return;
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      Logger.info(`Added meeting id=${meetingId}`);
    }

    if (numChanged) {
      Logger.info(`Upserted meeting id=${meetingId}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
}
