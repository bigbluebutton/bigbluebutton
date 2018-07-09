import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import BridgeService from './service';
import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import { log } from '/imports/ui/services/api';

const SFU_CONFIG = Meteor.settings.public.kurento;
const SFU_URL = SFU_CONFIG.wsUrl;
const CHROME_DEFAULT_EXTENSION_KEY = SFU_CONFIG.chromeDefaultExtensionKey;
const CHROME_CUSTOM_EXTENSION_KEY = SFU_CONFIG.chromeExtensionKey;
const CHROME_SCREENSHARE_SOURCES = SFU_CONFIG.chromeScreenshareSources;
const FIREFOX_SCREENSHARE_SOURCE = SFU_CONFIG.firefoxScreenshareSource;
const SCREENSHARE_VIDEO_TAG = 'screenshareVideo';

const CHROME_EXTENSION_KEY = CHROME_CUSTOM_EXTENSION_KEY === 'KEY' ? CHROME_DEFAULT_EXTENSION_KEY : CHROME_CUSTOM_EXTENSION_KEY;

const getUserId = () => Auth.userID;

const getMeetingId = () => Auth.meetingID;

const getUsername = () => Users.findOne({ userId: getUserId() }).name;

const getSessionToken = () => Auth.sessionToken;

export default class KurentoScreenshareBridge {
  async kurentoWatchVideo() {
    let iceServers = [];

    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(getSessionToken());
    } catch (error) {
      log('error', 'Screenshare bridge failed to fetch STUN/TURN info, using default');
    } finally {
      const options = {
        wsUrl: SFU_URL,
        iceServers,
      };

      window.kurentoWatchVideo(
        SCREENSHARE_VIDEO_TAG,
        BridgeService.getConferenceBridge(),
        getUserId(),
        getMeetingId(),
        null,
        null,
        options
      );
    };
  }

  kurentoExitVideo() {
    window.kurentoExitVideo();
  }

  async kurentoShareScreen() {
    let iceServers = [];
    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(getSessionToken());
    } catch (error) {
      log('error', 'Screenshare bridge failed to fetch STUN/TURN info, using default');
    } finally {
      const options = {
        wsUrl: SFU_URL,
        chromeExtension: CHROME_EXTENSION_KEY,
        chromeScreenshareSources: CHROME_SCREENSHARE_SOURCES,
        firefoxScreenshareSource: FIREFOX_SCREENSHARE_SOURCE,
        iceServers,
      };

      window.kurentoShareScreen(
        SCREENSHARE_VIDEO_TAG,
        BridgeService.getConferenceBridge(),
        getUserId(),
        getMeetingId(),
        null,
        null,
        options
      );
    }
  }

  kurentoExitScreenShare() {
    window.kurentoExitScreenShare();
  }
}
