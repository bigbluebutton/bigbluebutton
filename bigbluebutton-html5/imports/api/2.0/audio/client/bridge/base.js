export default class BaseAudioBridge {
  constructor(userData) {
    this.userData = userData;

    this.baseErrorCodes = {
      INVALID_TARGET: 'Invalid Target',
      CONNECTION_ERROR: 'Connection Error',
      REQUEST_TIMEOUT: 'Request Timeout',
      GENERIC_ERROR: 'An Error Occurred',
    };

    this.baseCallStates = {
      started: 'started',
      ended: 'ended',
      failed: 'failed',
    };
  }

  exitAudio() {
    console.error('The Bridge must implement exitAudio');
  }

  joinAudio() {
    console.error('The Bridge must implement joinAudio');
  }
}
