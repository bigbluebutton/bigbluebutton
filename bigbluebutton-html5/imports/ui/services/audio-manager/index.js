import { Tracker } from 'meteor/tracker';

const joinAudioMicrophone = (cb) => {
  this.setTimeout(() => {
    console.log('joining microphone mock...');
    cb();
  }, 1000)
}

const exitAudio = (cb) => {
  setTimeout(() => {
    console.log('exit audio mock...');
    cb();
  }, 1000);
}

const toggleMuteMicrophone = (cb) => {
  cb();
}

// const collection = new Mongo.Collection(null);

class AudioManager {
  constructor() {
    this.defineProperties({
      isMuted: false,
      isConnected: false,
      isConnecting: false,
      isListenOnly: null,
      error: null,
      inputDeviceId: null,
      outputDeviceId: null,
    });
  }

  defineProperties(obj) {
    Object.keys(obj).forEach(key => {
      let originalKey = `_${key}`;
      this[originalKey] = {
        value: obj[key],
        tracker: new Tracker.Dependency
      }

      Object.defineProperty(this, key, {
        set: (value) => {
          this[originalKey].value = value;
          this[originalKey].tracker.changed();
          // console.log('set', originalKey, value);
          // this.update(originalKey, value);
        },
        get: () => {
          this[originalKey].tracker.depend();
          return this[originalKey].value;
          // console.log('get', originalKey, collection.findOne({})[originalKey]);
          // return collection.findOne({})[originalKey];
        }
      })
    })

    // return collection.insert(obj);
  }

  joinAudio(isListenOnly) {
    console.log('joinAudio', this, isListenOnly);
    this.isConnecting = true;
    this.isListenOnly = isListenOnly

    joinAudioMicrophone(this.onAudioJoin.bind(this));
  }

  exitAudio() {
    console.log('exitAudio', this);
    exitAudio(this.onAudioExit.bind(this));
  }

  toggleMuteMicrophone() {
    console.log('toggleMuteMicrophone', this);
    toggleMuteMicrophone(this.onToggleMicrophoneMute.bind(this));
  }

  //----------------------------

  onAudioJoin() {
    this.isConnected = true;
    this.isConnecting = false;
    console.log('onAudioJoin', this);
  }

  onAudioExit() {
    this.isConnected = false;
    this.isListenOnly = null;
    this.isMuted = false;
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
}

const audioManager = new AudioManager();
export default audioManager;
