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
let contextDestination = null;
let stubAudioElement = null;
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

  if (contextDestination) {
    contextDestination.disconnect();
    contextDestination = null;
  }

  if (stubAudioElement) {
    stubAudioElement.pause();
    stubAudioElement.srcObject = null;
    stubAudioElement = null;
  }
};

const addDelayNode = (stream) => {
  if (stream) {
    if (delayNode || audioContext || sourceContext) cleanupDelayNode();
    const audioElement = document.querySelector(MEDIA_TAG);
    // Workaround: attach the stream to a muted stub audio element to be able to play it in
    // Chromium-based browsers. See https://bugs.chromium.org/p/chromium/issues/detail?id=933677
    stubAudioElement = new Audio();
    stubAudioElement.muted = true;
    stubAudioElement.srcObject = stream;

    // Create a new AudioContext to be able to add a delay to the stream
    audioContext = new AudioContext();
    sourceContext = audioContext.createMediaStreamSource(stream);
    contextDestination = audioContext.createMediaStreamDestination();
    // Create a DelayNode to add a delay to the stream
    delayNode = new DelayNode(audioContext, { delayTime, maxDelayTime });
    // Connect the stream to the DelayNode and then to the MediaStreamDestinationNode
    // to be able to play the stream.
    sourceContext.connect(delayNode);
    delayNode.connect(contextDestination);
    delayNode.delayTime.setValueAtTime(delayTime, audioContext.currentTime);
    // Play the stream with the delay in the default audio element (remote-media)
    audioElement.srcObject = contextDestination.stream;
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
    deattachEchoStream();
    let streamToPlay = stream;

    if (loopbackAgent) {
      // Chromium based browsers need audio to go through PCs for echo cancellation
      // to work. See https://bugs.chromium.org/p/chromium/issues/detail?id=687574
      try {
        await loopbackAgent.start(stream);
        streamToPlay = loopbackAgent.loopbackStream;
      } catch (error) {
        loopbackAgent.stop();
      }
    }

    if (DELAY_ENABLED) {
      addDelayNode(streamToPlay);
    } else {
      // No delay: play the stream in the default audio element (remote-media),
      // no strings attached.
      const audioElement = document.querySelector(MEDIA_TAG);
      audioElement.srcObject = streamToPlay;
      audioElement.muted = false;
      audioElement.play();
    }
  }
};

export default {
  useRTCLoopback,
  createAudioRTCLoopback,
  deattachEchoStream,
  playEchoStream,
};
