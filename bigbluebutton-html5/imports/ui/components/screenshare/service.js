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

const VOLUME_CONTROL_ENABLED = Meteor.settings.public.kurento.screenshare.enableVolumeControl;
const SCREENSHARE_MEDIA_ELEMENT_NAME = 'screenshareVideo';

/**
 * Screenshare status to be filtered in getStats()
 */
const FILTER_SCREENSHARE_STATS = [
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

const setVolume = (volume) => {
  KurentoBridge.setVolume(volume);
};

const getVolume = () => KurentoBridge.getVolume();

const shouldEnableVolumeControl = () => VOLUME_CONTROL_ENABLED && screenshareHasAudio();

const attachLocalPreviewStream = (mediaElement) => {
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
    if(!isPresenter) return MediaStreamUtils.stopMediaStreamTracks(stream);
    await KurentoBridge.share(stream, onFail);
    setSharingScreen(true);
  } catch (error) {
    return onFail(error);
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
   * Get stats about all active screenshare peer.
   * We filter the status based on FILTER_SCREENSHARE_STATS constant.
   *
   * For more information see:
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   * and
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
   * @returns An Object containing the information about each active peer
   *          (currently one, for screenshare). The returned format
   *          follows the format returned by video's service getStats, which
   *          considers more than one peer connection to be returned.
   *          The format is given by:
   *          {
   *            peerIdString: RTCStatsReport
   *          }
   */
const getStats = async () => {
  const peer = KurentoBridge.getPeerConnection();

  if (!peer) return null;

  const peerStats = await peer.getStats();

  const screenshareStats = {};

  peerStats.forEach((stat) => {
    if (FILTER_SCREENSHARE_STATS.includes(stat.type)) {
      screenshareStats[stat.type] = stat;
    }
  });

  return { screenshareStats };
};

export {
  SCREENSHARE_MEDIA_ELEMENT_NAME,
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
  attachLocalPreviewStream,
  isGloballyBroadcasting,
  getStats,
  setVolume,
  getVolume,
  shouldEnableVolumeControl,
};
