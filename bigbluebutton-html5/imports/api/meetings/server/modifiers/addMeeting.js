import flat from 'flat';
import {
  check,
  Match,
} from 'meteor/check';
import SanitizeHTML from 'sanitize-html';
import Meetings, {
  RecordMeetings,
  ExternalVideoMeetings,
  LayoutMeetings,
} from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { initPads } from '/imports/api/pads/server/helpers';
import createTimer from '/imports/api/timer/server/methods/createTimer';
import { initCaptions } from '/imports/api/captions/server/helpers';
import { addAnnotationsStreamer } from '/imports/api/annotations/server/streamer';
import { addCursorStreamer } from '/imports/api/cursor/server/streamer';
import { addExternalVideoStreamer } from '/imports/api/external-videos/server/streamer';
import addUserReactionsObserver from '/imports/api/user-reaction/server/helpers';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';

const addExternalVideo = async (meetingId) => {
  const selector = { meetingId };

  const modifier = {
    meetingId,
    externalVideoUrl: null,
  };

  try {
    const { numberAffected } = await ExternalVideoMeetings.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Added external video meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding external video: ${err}`);
  }
};

const addLayout = async (meetingId, layout) => {
  const selector = { meetingId };

  const modifier = {
    meetingId,
    layout,
    layoutUpdatedAt: new Date().getTime(),
    presentationIsOpen: true,
    isResizing: false,
    cameraPosition: 'contentTop',
    focusedCamera: 'none',
    presentationVideoRate: 0,
    pushLayout: false,
  };

  try {
    const { numberAffected } = await LayoutMeetings.upsertAsync(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Added layout meetingId=${meetingId}`, numberAffected);
    }
  } catch (err) {
    Logger.error(`Adding layout: ${err}`);
  }
};

export default async function addMeeting(meeting) {
  const meetingId = meeting.meetingProp.intId;

  check(meetingId, String);
  check(meeting, {
    breakoutProps: {
      sequence: Number,
      freeJoin: Boolean,
      breakoutRooms: Array,
      parentId: String,
      record: Boolean,
      privateChatEnabled: Boolean,
      captureNotes: Boolean,
      captureSlides: Boolean,
      captureNotesFilename: String,
      captureSlidesFilename: String,
    },
    meetingProp: {
      intId: String,
      extId: String,
      meetingCameraCap: Number,
      maxPinnedCameras: Number,
      isBreakout: Boolean,
      name: String,
      disabledFeatures: Array,
      notifyRecordingIsOn: Boolean,
      presentationUploadExternalDescription: String,
      presentationUploadExternalUrl: String,
    },
    usersProp: {
      maxUsers: Number,
      maxUserConcurrentAccesses: Number,
      webcamsOnlyForModerator: Boolean,
      userCameraCap: Number,
      guestPolicy: String,
      authenticatedGuest: Boolean,
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
    metadataProp: Object,
    lockSettingsProps: {
      disableCam: Boolean,
      disableMic: Boolean,
      disablePrivateChat: Boolean,
      disablePublicChat: Boolean,
      disableNotes: Boolean,
      hideUserList: Boolean,
      lockOnJoin: Boolean,
      lockOnJoinConfigurable: Boolean,
      hideViewersCursor: Boolean,
      hideViewersAnnotation: Boolean,
    },
    systemProps: {
      html5InstanceId: Number,
    },
    groups: Array,
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

  const sanitizeTextInChat = (original) => SanitizeHTML(original, {
    allowedTags: ['a', 'b', 'br', 'i', 'img', 'li', 'small', 'span', 'strong', 'u', 'ul'],
    allowedAttributes: {
      a: ['href', 'target'],
      img: ['src', 'width', 'height'],
    },
    allowedSchemes: ['https'],
    allowedSchemesByTag: {
      a: ['https', 'mailto', 'tel'],
    },
  });

  const sanitizedWelcomeText = sanitizeTextInChat(welcomeMsg);
  welcomeMsg = sanitizedWelcomeText.replace(
    'href="event:',
    'href="',
  );

  const insertBlankTarget = (s, i) => `${s.substr(0, i)} target="_blank"${s.substr(i)}`;
  const linkWithoutTarget = new RegExp('<a href="(.*?)">', 'g');

  do {
    linkWithoutTarget.test(welcomeMsg);

    if (linkWithoutTarget.lastIndex > 0) {
      welcomeMsg = insertBlankTarget(
        welcomeMsg,
        linkWithoutTarget.lastIndex - 1,
      );
      linkWithoutTarget.lastIndex -= 1;
    }
  } while (linkWithoutTarget.lastIndex > 0);

  newMeeting.welcomeProp.welcomeMsg = welcomeMsg;

  // note: as of July 2020 `modOnlyMessage` is not published to the client side.
  // We are sanitizing this data simply to prevent future potential usage
  // At the moment `modOnlyMessage` is obtained from client side as a response to Enter API
  newMeeting.welcomeProp.modOnlyMessage = sanitizeTextInChat(newMeeting.welcomeProp.modOnlyMessage);

  const { meetingLayout } = meeting.usersProp;

  const modifier = {
    $set: {
      meetingId,
      meetingEnded,
      layout: LAYOUT_TYPE[meetingLayout] || 'smart',
      publishedPoll: false,
      guestLobbyMessage: '',
      randomlySelectedUser: [],
      ...flat(newMeeting, {
        safe: true,
      }),
    },
  };

  if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
    addAnnotationsStreamer(meetingId);
    addCursorStreamer(meetingId);
    addExternalVideoStreamer(meetingId);

    // we don't want to fully process the create meeting message
    // in frontend since it can lead to duplication of meetings in mongo.
    if (process.env.BBB_HTML5_ROLE === 'frontend') {
      return;
    }
  }

  try {
    const {
      insertedId,
      numberAffected,
    } = await RecordMeetings.upsertAsync(selector, { meetingId, ...recordProp });

    if (insertedId) {
      Logger.info(`Added record prop id=${meetingId}`);
    } else if (numberAffected) {
      Logger.info(`Upserted record prop id=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding record prop to collection: ${err}`);
  }

  await addExternalVideo(meetingId);
  await addLayout(meetingId, LAYOUT_TYPE[meetingLayout] || 'smart');

  try {
    const { insertedId, numberAffected } = await Meetings.upsertAsync(selector, modifier);

    if (insertedId) {
      Logger.info(`Added meeting id=${meetingId}`);
      // Init Timer collection
      createTimer(meetingId);
      if (newMeeting.meetingProp.disabledFeatures.indexOf('sharedNotes') === -1) {
        initPads(meetingId);
      }
      if (newMeeting.meetingProp.disabledFeatures.indexOf('captions') === -1) {
        await initCaptions(meetingId);
      }
      if (newMeeting.meetingProp.disabledFeatures.indexOf('reactions') === -1) {
        await addUserReactionsObserver(meetingId);
      }
    } else if (numberAffected) {
      Logger.info(`Upserted meeting id=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding meeting to collection: ${err}`);
  }
}
