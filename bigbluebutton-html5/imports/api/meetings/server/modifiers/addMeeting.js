import flat from 'flat';
import {
  check,
  Match,
} from 'meteor/check';
import SanitizeHTML from 'sanitize-html';
import Meetings, { RecordMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import createNote from '/imports/api/note/server/methods/createNote';
import createCaptions from '/imports/api/captions/server/methods/createCaptions';
import { addAnnotationsStreamer } from '/imports/api/annotations/server/streamer';
import { addCursorStreamer } from '/imports/api/cursor/server/streamer';
import BannedUsers from '/imports/api/users/server/store/bannedUsers';

export default function addMeeting(meeting) {
  const meetingId = meeting.meetingProp.intId;

  check(meetingId, String);
  check(meeting, {
    breakoutProps: {
      sequence: Number,
      freeJoin: Boolean,
      breakoutRooms: Array,
      parentId: String,
      enabled: Boolean,
      record: Boolean,
      privateChatEnabled: Boolean,
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
      allowModsToUnmuteUsers: Boolean,
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
    lockSettingsProps: {
      disableCam: Boolean,
      disableMic: Boolean,
      disablePrivateChat: Boolean,
      disablePublicChat: Boolean,
      disableNote: Boolean,
      hideUserList: Boolean,
      lockOnJoin: Boolean,
      lockOnJoinConfigurable: Boolean,
      lockedLayout: Boolean,
    },
  });

  const {
    recordProp,
    ...restProps
  } = meeting;

  const newMeeting = restProps;

  const selector = {
    meetingId,
  };

  newMeeting.lockSettingsProps = Object.assign(meeting.lockSettingsProps, { setBy: 'temp' });

  const meetingEnded = false;

  let { welcomeMsg } = newMeeting.welcomeProp;

  const sanitizeTextInChat = original => SanitizeHTML(original, {
    allowedTags: ['a', 'b', 'br', 'i', 'img', 'li', 'small', 'span', 'strong', 'u', 'ul'],
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      img: ['src', 'width', 'height'],
    },
    allowedSchemes: ['https'],
  });

  const sanitizedWelcomeText = sanitizeTextInChat(welcomeMsg);
  welcomeMsg = sanitizedWelcomeText.replace(
    'href="event:',
    'href="',
  );

  const insertBlankTarget = (s, i) => `${s.substr(0, i)} target="_blank"${s.substr(i)}`;
  const linkWithoutTarget = new RegExp('<a href="(.*?)">', 'g');
  linkWithoutTarget.test(welcomeMsg);

  if (linkWithoutTarget.lastIndex > 0) {
    welcomeMsg = insertBlankTarget(
      welcomeMsg,
      linkWithoutTarget.lastIndex - 1,
    );
  }

  newMeeting.welcomeProp.welcomeMsg = welcomeMsg;

  // note: as of July 2020 `modOnlyMessage` is not published to the client side.
  // We are sanitizing this data simply to prevent future potential usage
  // At the moment `modOnlyMessage` is obtained from client side as a response to Enter API
  newMeeting.welcomeProp.modOnlyMessage = sanitizeTextInChat(newMeeting.welcomeProp.modOnlyMessage);

  const modifier = {
    $set: Object.assign({
      meetingId,
      meetingEnded,
      publishedPoll: false,
    }, flat(newMeeting, {
      safe: true,
    })),
  };

  try {
    const { insertedId, numberAffected } = RecordMeetings.upsert(selector, { meetingId, ...recordProp });

    if (insertedId) {
      Logger.info(`Added record prop id=${meetingId}`);
    } else if (numberAffected) {
      Logger.info(`Upserted record prop id=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding record prop to collection: ${err}`);
  }

  try {
    const { insertedId, numberAffected } = Meetings.upsert(selector, modifier);

    addAnnotationsStreamer(meetingId);
    addCursorStreamer(meetingId);

    if (insertedId) {
      Logger.info(`Added meeting id=${meetingId}`);
      // TODO: Here we call Etherpad API to create this meeting notes. Is there a
      // better place we can run this post-creation routine?
      createNote(meetingId);
      createCaptions(meetingId);
      BannedUsers.init(meetingId);
    } else if (numberAffected) {
      Logger.info(`Upserted meeting id=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding meeting to collection: ${err}`);
  }
}
