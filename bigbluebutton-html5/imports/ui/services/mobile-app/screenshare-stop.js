import browserInfo from '/imports/utils/browserInfo';
import { callNativeMethod } from './native-bridge';

/**
 * Ask the tablet native shell to tear down broadcast upload.
 * Uses the shared bridge — does not import the RTCPeerConnection patch module.
 */
const onScreenshareStopRequest = () => {
  if (!browserInfo.isTabletApp) return;
  callNativeMethod('stopScreenShare');
};

export default onScreenshareStopRequest;
