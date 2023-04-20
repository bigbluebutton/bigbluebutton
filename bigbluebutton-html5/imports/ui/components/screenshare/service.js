import Screenshare from '/imports/api/screenshare';
import KurentoBridge from '/imports/api/screenshare/client/bridge';
import BridgeService from '/imports/api/screenshare/client/bridge/service';
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import { stopWatching } from '/imports/ui/components/external-video-player/service';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import AudioService from '/imports/ui/components/audio/service';
import { Meteor } from "meteor/meteor";
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import browserInfo from '/imports/utils/browserInfo';
import NotesService from '/imports/ui/components/notes/service';

const VOLUME_CONTROL_ENABLED = Meteor.settings.public.kurento.screenshare.enableVolumeControl;
const SCREENSHARE_MEDIA_ELEMENT_NAME = 'screenshareVideo';

const DEFAULT_SCREENSHARE_STATS_TYPES = [
  'outbound-rtp',
  'inbound-rtp',
];

let _isSharingScreen = false;
const _sharingScreenDep = {
  value: false,
  tracker: new Tracker.Dependency(),
};

const isSharingScreen = () => {
  _sharingScreenDep.tracker.depend();
  return _sharingScreenDep.value;
};

const setSharingScreen = (isSharingScreen) => {
  if (_sharingScreenDep.value !== isSharingScreen) {
    _sharingScreenDep.value = isSharingScreen;
    _sharingScreenDep.tracker.changed();
  }
};

const _trackStreamTermination = (stream, handler) => {
  if (typeof stream !== 'object' || typeof handler !== 'function') {
    throw new TypeError('Invalid trackStreamTermination arguments');
  }

  if (stream.oninactive === null) {
    stream.addEventListener('inactive', handler, { once: true });
  } else {
    const track = MediaStreamUtils.getVideoTracks(stream)[0];
    if (track) {
      track.addEventListener('ended', handler, { once: true });
      track.onended = handler;
    }
  }
};

const _isStreamActive = (stream) => {
  const tracksAreActive = !stream.getTracks().some(track => track.readyState === 'ended');

  return tracksAreActive && stream.active;
}

const _handleStreamTermination = () => {
  screenshareHasEnded();
};

// A simplified, trackable version of isVideoBroadcasting that DOES NOT
// account for the presenter's local sharing state.
// It reflects the GLOBAL screen sharing state (akka-apps)
const isGloballyBroadcasting = () => {
  const screenshareEntry = Screenshare.findOne({ meetingId: Auth.meetingID },
    { fields: { 'screenshare.stream': 1 } });

  return (!screenshareEntry ? false : !!screenshareEntry.screenshare.stream);
}

// when the meeting information has been updated check to see if it was
// screensharing. If it has changed either trigger a call to receive video
// and display it, or end the call and hide the video
const isVideoBroadcasting = () => {
  const sharing = isSharingScreen();
  const screenshareEntry = Screenshare.findOne({ meetingId: Auth.meetingID },
    { fields: { 'screenshare.stream': 1 } });
  const screenIsShared = !screenshareEntry ? false : !!screenshareEntry.screenshare.stream;

  if (screenIsShared && isSharingScreen) {
    setSharingScreen(false);
  }

  return sharing || screenIsShared;
};


const screenshareHasAudio = () => {
  const screenshareEntry = Screenshare.findOne({ meetingId: Auth.meetingID },
    { fields: { 'screenshare.hasAudio': 1 } });

  if (!screenshareEntry) {
    return false;
  }

  return !!screenshareEntry.screenshare.hasAudio;
}

const screenshareHasEnded = () => {
  if (isSharingScreen()) {
    setSharingScreen(false);
  }

  KurentoBridge.stop();
};

const getMediaElement = () => {
  return document.getElementById(SCREENSHARE_MEDIA_ELEMENT_NAME);
}

const getMediaElementDimensions = () => {
  const element = getMediaElement();
  return {
    width: element?.videoWidth ?? 0,
    height: element?.videoHeight ?? 0,
  };
};

const setVolume = (volume) => {
  KurentoBridge.setVolume(volume);
};

const getVolume = () => KurentoBridge.getVolume();

const shouldEnableVolumeControl = () => VOLUME_CONTROL_ENABLED && screenshareHasAudio();

const attachLocalPreviewStream = (mediaElement) => {
  const {isTabletApp} = browserInfo;
  if (isTabletApp) {
    // We don't show preview for mobile app, as the stream is only available in native code
    return;
  }
  const stream = KurentoBridge.gdmStream;
  if (stream && mediaElement) {
    // Always muted, presenter preview.
    BridgeService.screenshareLoadAndPlayMediaStream(stream, mediaElement, true);
  }
}

const screenshareHasStarted = (isPresenter) => {
  // Presenter's screen preview is local, so skip
  if (!isPresenter) {
    viewScreenshare();
  }
};

const shareScreen = async (isPresenter, onFail) => {
  // stop external video share if running
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });

  if (meeting && meeting.externalVideoUrl) {
    stopWatching();
  }

  try {
    const stream = await BridgeService.getScreenStream();
    _trackStreamTermination(stream, _handleStreamTermination);

    if (!isPresenter) {
      MediaStreamUtils.stopMediaStreamTracks(stream);
      return;
    }

    await KurentoBridge.share(stream, onFail);

    // Stream might have been disabled in the meantime. I love badly designed
    // async components like this screen sharing bridge :) - prlanzarin 09 May 22
    if (!_isStreamActive(stream)) {
      _handleStreamTermination();
      return;
    }

    // Close Shared Notes if open.
    NotesService.pinSharedNotes(false);

    setSharingScreen(true);
  } catch (error) {
    onFail(error);
  }
};

const viewScreenshare = () => {
  const hasAudio = screenshareHasAudio();
  KurentoBridge.view(hasAudio).catch((error) => {
    logger.error({
      logCode: 'screenshare_view_failed',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, `Screenshare viewer failure`);
  });
};

const screenShareEndAlert = () => AudioService
  .playAlertSound(`${Meteor.settings.public.app.cdn
    + Meteor.settings.public.app.basename
    + Meteor.settings.public.app.instanceId}`
    + '/resources/sounds/ScreenshareOff.mp3');

const dataSavingSetting = () => Settings.dataSaving.viewScreenshare;

/**
   * Get stats about all active screenshare peers.
   *
   * For more information see:
   *  - https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   *  - https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport

   * @param {Array[String]} statsType - An array containing valid RTCStatsType
   *                                    values to include in the return object
   *
   * @returns {Object} The information about each active screen sharing peer.
   *          The returned format follows the format returned by video's service
   *          getStats, which considers more than one peer connection to be returned.
   *          The format is given by:
   *          {
   *            peerIdString: RTCStatsReport
   *          }
   */
const getStats = async (statsTypes = DEFAULT_SCREENSHARE_STATS_TYPES) => {
  const screenshareStats = {};
  const peer = KurentoBridge.getPeerConnection();

  if (!peer) return null;

  const peerStats = await peer.getStats();

  peerStats.forEach((stat) => {
    if (statsTypes.includes(stat.type)) {
      screenshareStats[stat.type] = stat;
    }
  });

  return { screenshareStats };
};

// This method may throw errors
const isMediaFlowing = (previousStats, currentStats) => {
  const bpsData = ConnectionStatusService.calculateBitsPerSecond(
    currentStats?.screenshareStats,
    previousStats?.screenshareStats,
  );
  const bpsDataAggr = Object.values(bpsData)
    .reduce((sum, partialBpsData = 0) => sum + parseFloat(partialBpsData), 0);

  return bpsDataAggr > 0;
};

export {
  SCREENSHARE_MEDIA_ELEMENT_NAME,
  isMediaFlowing,
  isVideoBroadcasting,
  screenshareHasEnded,
  screenshareHasStarted,
  screenshareHasAudio,
  shareScreen,
  screenShareEndAlert,
  dataSavingSetting,
  isSharingScreen,
  setSharingScreen,
  getMediaElement,
  getMediaElementDimensions,
  attachLocalPreviewStream,
  isGloballyBroadcasting,
  getStats,
  setVolume,
  getVolume,
  shouldEnableVolumeControl,
};
