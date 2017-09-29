import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import VertoBridge from '/imports/api/2.0/audio/client/bridge/verto';
import SIPBridge from '/imports/api/2.0/audio/client/bridge/sip';

const USE_SIP = Meteor.settings.public.media.useSIPAudio;

const toggleMuteMicrophone = (cb) => {
  cb();
};

// const collection = new Mongo.Collection(null);

class AudioManager {
  constructor() {
    this.defineProperties({
      isMuted: false,
      isConnected: false,
      isConnecting: false,
      isListenOnly: false,
      isEchoTest: false,
      error: null,
      inputDeviceId: null,
      outputDeviceId: null,
    });
  }

  defineProperties(obj) {
    Object.keys(obj).forEach((key) => {
      const privateKey = `_${key}`;
      this[privateKey] = {
        value: obj[key],
        tracker: new Tracker.Dependency,
      };

      Object.defineProperty(this, key, {
        set: (value) => {
          this[privateKey].value = value;
          this[privateKey].tracker.changed();
          // console.log('set', privateKey, value);
          // this.update(privateKey, value);
        },
        get: () => {
          this[privateKey].tracker.depend();
          return this[privateKey].value;
          // console.log('get', privateKey, collection.findOne({})[privateKey]);
          // return collection.findOne({})[privateKey];
        },
      });
    });

    // return collection.insert(obj);
  }

  joinAudio(options = {}, callbacks = {}) {
    const {
      isListenOnly,
      isEchoTest,
    } = options;

    console.log('joinAudio', this, isListenOnly);
    this.isConnecting = true;
    this.isListenOnly = isListenOnly;
    this.isEchoTest = isEchoTest;
    this.callbacks = callbacks;

    const callOptions = {
      isListenOnly,
      dialplan: isEchoTest ? '9196' : null,
    }

    return this.fetchStunTurn().then((stunTurnServers) =>
      this.bridge.joinAudio(callOptions,
                            stunTurnServers,
                            this.callStateCallback.bind(this))
    ).catch((error) => {
      console.error('error', error)
    })
  }

  exitAudio() {
    console.log('exitAudio', this);
    return this.bridge.exitAudio()
  }

  toggleMuteMicrophone() {
    console.log('toggleMuteMicrophone', this);
    toggleMuteMicrophone(this.onToggleMicrophoneMute.bind(this));
  }

  callbackToAudioBridge(message) {
    console.log('This is the Manager Callback', message);
  }

  //----------------------------

  onAudioJoin() {
    if (!this.isEchoTest) {
      this.isConnected = true;
    }
    this.isConnecting = false;

    if (this.isListenOnly) {
      makeCall('listenOnlyToggle', true);
    }

    console.log('onAudioJoin', this);
  }

  onAudioExit() {
    this.isConnected = false;

    if (this.isListenOnly) {
      makeCall('listenOnlyToggle', false);
    } else if (this.isEchoTest) {
      this.isEchoTest = false;
    }

    console.log('onAudioExit', this);
  }

  onToggleMicrophoneMute() {
    this.isMuted = !this.isMuted;
    console.log('onToggleMicrophoneMute', this);
  }

  //---------------------------
  // update(key, value) {
  //   const query = { _id: this.stateId };
  //   const modifier = { $set: { [key]: value }};
  //   collection.update(query, modifier);
  // }

  callStateCallback({ status }) {
    console.log('CALLSTATECALLBACK =====================', status);
    return new Promise((resolve) => {
      const {
        callStarted,
        callEnded,
        callDisconnected,
      } = this.bridge.callStates;

      if (status === callStarted) {
        this.onAudioJoin();
        resolve(callStarted);
      } else if (status === callEnded) {
        this.onAudioExit();
      } else if (status === callDisconnected) {
        this.onAudioExit();
      }
    })
  }

  fetchStunTurn() {
    return new Promise(async (resolve, reject) => {
      const url = `/bigbluebutton/api/stuns?sessionToken=${this.userData.sessionToken}`;

      let response = await fetch(url)
        .then(response => response.json())
        .then(({ response, stunServers, turnServers}) => {
          console.log(response, stunServers, turnServers);
          return new Promise((resolve) => {
            if (response) {
              resolve({ error: 404, stun: [], turn: [] });
            }
            console.log('krappa');
            resolve({
              stun: stunServers.map(server => server.url),
              turn: turnServers.map(server => server.url),
            });
          });
        });

        console.log(response);
      if(response.error) return reject(`Could not fetch the stuns/turns servers!`);
      resolve(response);
    })
  }

  set userData(value) {
    console.log('set user data');
    this._userData = value;
    this.bridge = USE_SIP ? new SIPBridge(value) : new VertoBridge(value);
  }

  get userData() {
    return this._userData;
  }
}

const audioManager = new AudioManager();
export default audioManager;
