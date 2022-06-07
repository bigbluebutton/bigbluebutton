import flat from 'flat';
import {
  check,
  Match,
} from 'meteor/check';
import SanitizeHTML from 'sanitize-html';
import Meetings, {
  RecordMeetings,
  ExternalVideoMeetings,
} from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { initPads } from '/imports/api/common/server/etherpad';
import { addAnnotationsStreamer } from '/imports/api/annotations/server/streamer';
import { addCursorStreamer } from '/imports/api/cursor/server/streamer';
import { addExternalVideoStreamer } from '/imports/api/external-videos/server/streamer';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';

const addExternalVideo = (meetingId) => {
  const selector = { meetingId };

  const modifier = {
    meetingId,
    externalVideoUrl: null,
  };

  try {
    const { numberAffected } = ExternalVideoMeetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Added external video meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding external video: ${err}`);
  }
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
      enabled: Boolean,
      record: Boolean,
      privateChatEnabled: Boolean,
    },
    meetingProp: {
      intId: String,
      extId: String,
      isBreakout: Boolean,
      learningDashboardEnabled: Boolean,
      name: String,
    },
    usersProp: {
      webcamsOnlyForModerator: Boolean,
      guestPolicy: String,
      authenticatedGuest: Boolean,
      maxUsers: Number,
      allowModsToUnmuteUsers: Boolean,
      allowModsToEjectCameras: Boolean,
      meetingLayout: String,
    },
    durationProps: {
      createdTime: Number,
      duration: Number,
      createdDate: String,
      meetingExpireIfNoUserJoinedInMinutes: Number,
      meetingExpireWhenLastUserLeftInMinutes: Number,
      userInactivityInspectTimerInMinutes: Number,
      userInactivityThresholdInMinutes: Number,
      userActivitySignResponseDelayInMinutes: Number,
      endWhenNoModerator: Boolean,
      endWhenNoModeratorDelayInMinutes: Number,
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
      learningDashboardAccessToken: String,
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
    systemProps: {
      html5InstanceId: Number,
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
      layout: LAYOUT_TYPE[meeting.usersProp.meetingLayout] || 'smart',
      publishedPoll: false,
      guestLobbyMessage: '',
      randomlySelectedUser: [],
    }, flat(newMeeting, {
      safe: true,
    })),
  };

  if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
    addAnnotationsStreamer(meetingId);
    addCursorStreamer(meetingId);
    addExternalVideoStreamer(meetingId);

    // we don't want to fully process the create meeting message in frontend since it can lead to duplication of meetings in mongo.
    if (process.env.BBB_HTML5_ROLE === 'frontend') {
      return;
    }
  }

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

  addExternalVideo(meetingId);

  try {
    const { insertedId, numberAffected } = Meetings.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added meeting id=${meetingId}`);

      const { html5InstanceId } = meeting.systemProps;
      initPads(meetingId, html5InstanceId);
    } else if (numberAffected) {
      Logger.info(`Upserted meeting id=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding meeting to collection: ${err}`);
  }
}
