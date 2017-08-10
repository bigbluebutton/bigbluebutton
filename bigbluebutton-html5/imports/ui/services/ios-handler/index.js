import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/components/audio/service';

class IosHandler {
  constructor() {
    this.isIosApp = window.navigator.userAgent === 'BigBlueButton';

    if (this.isIosApp) {
      this.messageHandler = window.webkit.messageHandlers.bbb;
    }
  }

  postMessage(message) {
    console.log('isIosApp', this.isIosApp, message);
    if (this.isIosApp) {
      return this.messageHandler.postMessage(JSON.stringify(message));
    }
  }

  leaveRoom() {
    const message = {
      method: 'leaveRoom',
      meetingId: Auth.meetingID,
    };
    console.log('leaveRoom', message);
    return this.postMessage(message);
  }

  hangupCall() {
    const message = {
      method: 'hangup',
    };

    return this.postMessage(message);
  }

  updateBreakoutRooms(breakoutIds) {
    const message = {
      method: 'updateBreakoutRooms',
      ids: breakoutIds,
    };

    return this.postMessage(message);
  }

  requestMicrophoneLevelStart() {
    const message = {
      method: 'requestMicrophoneLevelStart',
    };

    return this.postMessage(message);
  }

  requestMicrophoneLevelStop() {
    const message = {
      method: 'requestMicrophoneLevelStop',
    };

    return this.postMessage(message)
  }

  goToRoom(url, meetingId) {
    const message = {
      method: 'goToRoom',
      url,
      meetingId,
    };

    return this.postMessage(message);
  }

  goToVideoREMOVETHIS() {
    const message = {
      method: 'goToVideo',
    };

    return this.postMessage(message);
  }

  sendCallParameters() {
    console.log('if ios app will send parameters from call');
    if (this.isIosApp) {
      console.log(AudioManager);
      AudioManager.sendCallParameters();
    }
  }

  goToMainMeeting() {
    this.goToRoom();
  }

  restartMeter() {
    console.log('restartMeter');
    this.requestMicrophoneLevelStop();
    this.requestMicrophoneLevelStart();
  }
}

const iosHandler = new IosHandler();
export default iosHandler
