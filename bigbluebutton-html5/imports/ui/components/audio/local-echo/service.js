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

    audioElement.srcObject = streamToPlay;
    audioElement.play();
  }
};

export default {
  useRTCLoopback,
  createAudioRTCLoopback,
  deattachEchoStream,
  playEchoStream,
};
