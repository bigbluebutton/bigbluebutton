import LocalPCLoopback from '/imports/ui/services/webrtc-base/local-pc-loopback';
import browserInfo from '/imports/utils/browserInfo';

const MEDIA_TAG = Meteor.settings.public.media.mediaTag;
const USE_RTC_LOOPBACK_CHR = Meteor.settings.public.media.localEchoTest.useRtcLoopbackInChromium;

const useRTCLoopback = () => (browserInfo.isChrome || browserInfo.isEdge) && USE_RTC_LOOPBACK_CHR;
const createAudioRTCLoopback = () => new LocalPCLoopback({ audio: true });

const deattachEchoStream = () => {
  const audioElement = document.querySelector(MEDIA_TAG);
  audioElement.pause();
  audioElement.srcObject = null;
};

const playEchoStream = async (stream, loopbackAgent = null) => {
  if (stream) {
    const audioElement = document.querySelector(MEDIA_TAG);
    deattachEchoStream();
    let streamToPlay = stream;

    if (loopbackAgent) {
      try {
        await loopbackAgent.start(stream);
        streamToPlay = loopbackAgent.loopbackStream;
      } catch (error) {
        loopbackAgent.stop();
      }
    }
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const delayNode = new DelayNode(audioCtx, {delayTime: 0.5, maxDelayTime: 2});
    delayNode.delayTime.setValueAtTime(0.5, audioCtx.currentTime);
    const streamdest = audioCtx.createMediaStreamDestination();
    source.connect(delayNode);
    delayNode.connect(audioCtx.destination)
    audioElement.srcObject = streamdest.stream;
    audioElement.play();
  }
};

export default {
  useRTCLoopback,
  createAudioRTCLoopback,
  deattachEchoStream,
  playEchoStream,
};
