import KurentoBridge from './kurento';
import LiveKitBridge from './livekit';

const sfuScreenShareBridge = new KurentoBridge();
const liveKitScreenShareBridge = new LiveKitBridge();

export {
  sfuScreenShareBridge,
  liveKitScreenShareBridge,
};
