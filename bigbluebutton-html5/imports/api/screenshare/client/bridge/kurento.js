import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import BridgeService from './service';
import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import logger from '/imports/startup/client/logger';

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
      logger.error({ logCode: 'sfuviewscreen_fetchstunturninfo_error', extraInfo: { error } },
        'Screenshare bridge failed to fetch STUN/TURN info, using default');
    } finally {
      const options = {
        wsUrl: Auth.authenticateURL(SFU_URL),
        iceServers,
        logger,
      };

      window.kurentoWatchVideo(
        SCREENSHARE_VIDEO_TAG,
        BridgeService.getConferenceBridge(),
        getUserId(),
        getMeetingId(),
        null,
        null,
        options,
      );
    }
  }

  kurentoExitVideo() {
    window.kurentoExitVideo();
  }

  async kurentoShareScreen(onFail) {
    let iceServers = [];
    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(getSessionToken());
    } catch (error) {
      logger.error({ logCode: 'sfusharescreen_fetchstunturninfo_error' },
        'Screenshare bridge failed to fetch STUN/TURN info, using default');
    } finally {
      const options = {
        wsUrl: Auth.authenticateURL(SFU_URL),
        chromeExtension: CHROME_EXTENSION_KEY,
        chromeScreenshareSources: CHROME_SCREENSHARE_SOURCES,
        firefoxScreenshareSource: FIREFOX_SCREENSHARE_SOURCE,
        iceServers,
        logger,
      };
      window.kurentoShareScreen(
        SCREENSHARE_VIDEO_TAG,
        BridgeService.getConferenceBridge(),
        getUserId(),
        getMeetingId(),
        onFail,
        null,
        options,
      );
    }
  }

  kurentoExitScreenShare() {
    window.kurentoExitScreenShare();
  }
}
