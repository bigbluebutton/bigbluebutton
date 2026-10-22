import browserInfo from '/imports/utils/browserInfo';
import logger from '/imports/startup/client/logger';

/**
 * Ask the tablet native shell to tear down broadcast upload.
 * Fire-and-forget postMessage — does not import the RTCPeerConnection patch module.
 */
const onScreenshareStopRequest = () => {
  if (!browserInfo.isTabletApp) return;
  try {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      sequence: 0,
      method: 'stopScreenShare',
      arguments: [],
    }));
  } catch (e) {
    logger.error(`BBB-MOBILE - onScreenshareStopRequest failed: ${e.message}`, e);
  }
};

export default onScreenshareStopRequest;
