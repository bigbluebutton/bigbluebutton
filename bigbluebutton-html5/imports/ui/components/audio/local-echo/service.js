import LocalPCLoopback from '/imports/ui/services/webrtc-base/local-pc-loopback';
import browserInfo from '/imports/utils/browserInfo';

const MEDIA_TAG = Meteor.settings.public.media.mediaTag;
const USE_RTC_LOOPBACK_CHR = Meteor.settings.public.media.localEchoTest.useRtcLoopbackInChromium;
const {
  enabled: DELAY_ENABLED = true,
  delayTime = 0.5,
  maxDelayTime = 2,
} = Meteor.settings.public.media.localEchoTest.delay;

let audioContext = null;
let sourceContext = null;
let delayNode = null;

const useRTCLoopback = () => (browserInfo.isChrome || browserInfo.isEdge) && USE_RTC_LOOPBACK_CHR;
const createAudioRTCLoopback = () => new LocalPCLoopback({ audio: true });

const cleanupDelayNode = () => {
  if (delayNode) {
    delayNode.disconnect();
    delayNode = null;
  }

  if (sourceContext) {
    sourceContext.disconnect();
    sourceContext = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};

const addDelayNode = (stream) => {
  if (stream) {
    if (delayNode || audioContext || sourceContext) cleanupDelayNode();

    audioContext = new AudioContext();
    sourceContext = audioContext.createMediaStreamSource(stream);
    delayNode = new DelayNode(audioContext, { delayTime, maxDelayTime });
    sourceContext.connect(delayNode);
    delayNode.connect(audioContext.destination);
    delayNode.delayTime.setValueAtTime(delayTime, audioContext.currentTime);
  }
};
const deattachEchoStream = () => {
  const audioElement = document.querySelector(MEDIA_TAG);

  if (DELAY_ENABLED) {
    audioElement.muted = false;
    cleanupDelayNode();
  }

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

    if (DELAY_ENABLED) {
      // Start muted to avoid weird artifacts and prevent playing the stream twice (Chromium)
      audioElement.muted = true;
      addDelayNode(streamToPlay);
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
