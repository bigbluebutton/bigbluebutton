import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import BridgeService from './service';
import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';

const SFU_CONFIG = Meteor.settings.public.kurento;
const SFU_URL = SFU_CONFIG.wsUrl;
const CHROME_DEFAULT_EXTENSION_KEY = SFU_CONFIG.chromeDefaultExtensionKey;
const CHROME_CUSTOM_EXTENSION_KEY = SFU_CONFIG.chromeExtensionKey;
const CHROME_SCREENSHARE_SOURCES = SFU_CONFIG.chromeScreenshareSources;
const FIREFOX_SCREENSHARE_SOURCE = SFU_CONFIG.firefoxScreenshareSource;
const SCREENSHARE_VIDEO_TAG = 'screenshareVideo';

const CHROME_EXTENSION_KEY = CHROME_CUSTOM_EXTENSION_KEY === 'KEY' ? CHROME_DEFAULT_EXTENSION_KEY : CHROME_CUSTOM_EXTENSION_KEY;

const ICE_CONNECTION_FAILED = 'ICE connection failed';

const getUserId = () => Auth.userID;

const getMeetingId = () => Auth.meetingID;

const getUsername = () => Users.findOne({ userId: getUserId() }).name;

const getSessionToken = () => Auth.sessionToken;

const logFunc = (type, message, options) => {
  const userId = getUserId();
  const userName = getUsername();

  const topic = options.topic || 'screenshare';

  logger[type]({ obj: Object.assign(options, { userId, userName, topic }) }, `[${topic}] ${message}`);
};

const modLogger = {
  info(message, options = {}) {
    logFunc('info', message, options);
  },
  error(message, options = {}) {
    logFunc('error', message, options);
  },
  debug(message, options = {}) {
    logFunc('debug', message, options);
  },
  warn: (message, options = {}) => {
    logFunc('warn', message, options);
  },
};

export default class KurentoScreenshareBridge {
  async kurentoWatchVideo() {
    let iceServers = [];

    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(getSessionToken());
    } catch (error) {
      logger.error({ logCode: 'kurentowatchvideo_fetchstunturninfo_error' }, 'Screenshare bridge failed to fetch STUN/TURN info, using default');
    } finally {
      const options = {
        wsUrl: Auth.authenticateURL(SFU_URL),
        iceServers,
        logger: modLogger,
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
      logger.error({ logCode: 'kurentosharescreen_fetchstunturninfo_error' }, 'Screenshare bridge failed to fetch STUN/TURN info, using default');
    } finally {
      const options = {
        wsUrl: Auth.authenticateURL(SFU_URL),
        chromeExtension: CHROME_EXTENSION_KEY,
        chromeScreenshareSources: CHROME_SCREENSHARE_SOURCES,
        firefoxScreenshareSource: FIREFOX_SCREENSHARE_SOURCE,
        iceServers,
        logger: modLogger,
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
