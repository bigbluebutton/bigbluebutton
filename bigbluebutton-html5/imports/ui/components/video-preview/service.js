import Storage from '/imports/ui/services/storage/session';
import { getStorageSingletonInstance } from '/imports/ui/services/storage';
import getFromUserSettings from '/imports/ui/services/users-settings';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import VideoService from '/imports/ui/components/video-provider/service';
import BBBVideoStream from '/imports/ui/services/webrtc-base/bbb-video-stream';
import browserInfo from '/imports/utils/browserInfo';

// GUM retry + delay params (Chrome only for now)
const GUM_MAX_RETRIES = 5;
const GUM_RETRY_DELAY = 200;
const CAMERA_AS_CONTENT_PROFILE_ID = 'fhd';

const getDefaultProfile = () => {
  const BBBStorage = getStorageSingletonInstance();
  // Unfiltered, includes hidden profiles
  const CAMERA_PROFILES = window.meetingClientSettings.public.kurento.cameraProfiles || [];

  return CAMERA_PROFILES.find((profile) => profile.id === BBBStorage.getItem('WebcamProfileId'))
    || CAMERA_PROFILES.find((profile) => profile.id === VideoService.getUserParameterProfile())
    || CAMERA_PROFILES.find((profile) => profile.default)
    || CAMERA_PROFILES[0];
};

const getCameraAsContentProfile = () => {
  // Unfiltered, includes hidden profiles
  const CAMERA_PROFILES = window.meetingClientSettings.public.kurento.cameraProfiles || [];

  return CAMERA_PROFILES.find((profile) => profile.id == CAMERA_AS_CONTENT_PROFILE_ID)
    || CAMERA_PROFILES.find((profile) => profile.default);
};

const getCameraProfile = (id) => {
  // Unfiltered, includes hidden profiles
  const CAMERA_PROFILES = window.meetingClientSettings.public.kurento.cameraProfiles || [];
  return CAMERA_PROFILES.find((profile) => profile.id === id);
};

// VIDEO_STREAM_STORAGE: Map<deviceId, MediaStream>. Registers WEBCAM streams.
// Easier to keep track of them. Easier to centralize their referencing.
// Easier to shuffle them around.
const VIDEO_STREAM_STORAGE = new Map();

const storeStream = (deviceId, stream) => {
  if (!stream) return false;

  // Check if there's a dangling stream. If there's one and it's active, cool,
  // return false as it's already stored. Otherwised, clean the derelict stream
  // and store the new one
  if (hasStream(deviceId)) {
    const existingStream = getStream(deviceId);
    if (existingStream.active) return false;
    deleteStream(deviceId);
  }

  VIDEO_STREAM_STORAGE.set(deviceId, stream);

  // Stream insurance: clean it up if it ends (see the events being listened to below)
  stream.once('inactive', () => {
    deleteStream(deviceId);
  });

  return true;
};

const getStream = (deviceId) => VIDEO_STREAM_STORAGE.get(deviceId);

const hasStream = (deviceId) => VIDEO_STREAM_STORAGE.has(deviceId);

const deleteStream = (deviceId) => {
  const stream = getStream(deviceId);
  if (stream == null) return false;
  MediaStreamUtils.stopMediaStreamTracks(stream);
  return VIDEO_STREAM_STORAGE.delete(deviceId);
};

const clearStreams = () => VIDEO_STREAM_STORAGE.clear();

const promiseTimeout = (ms, promise) => {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);

      const error = {
        name: 'TimeoutError',
        message: 'Promise did not return',
      };

      reject(error);
    }, ms);
  });

  return Promise.race([
    promise,
    timeout,
  ]);
};

const getSkipVideoPreview = () => {
  const KURENTO_CONFIG = window.meetingClientSettings.public.kurento;
  const BBBStorage = getStorageSingletonInstance();

  const skipVideoPreviewOnFirstJoin = getFromUserSettings(
    'bbb_skip_video_preview_on_first_join',
    KURENTO_CONFIG.skipVideoPreviewOnFirstJoin,
  );
  const skipVideoPreview = getFromUserSettings(
    'bbb_skip_video_preview',
    KURENTO_CONFIG.skipVideoPreview,
  );

  const skipVideoPreviewIfPreviousDevice = getFromUserSettings(
    'bbb_skip_video_preview_if_previous_device',
    KURENTO_CONFIG.skipVideoPreviewIfPreviousDevice,
  );

  return (
    (Storage.getItem('isFirstJoin') !== false && skipVideoPreviewOnFirstJoin)
    || (BBBStorage.getItem('WebcamDeviceId') && skipVideoPreviewIfPreviousDevice)
    || skipVideoPreview
  );
};

// Takes a raw list of media devices of any media type coming enumerateDevices
// and a deviceId to be prioritized
// Outputs an object containing:
//  webcams: videoinput media devices, priorityDevice being the first member of the array (if it exists)
//  areLabelled: whether all videoinput devices are labelled
//  areIdentified: whether all videoinput devices have deviceIds
const digestVideoDevices = (devices, priorityDevice) => {
  const webcams = [];
  let areLabelled = true;
  let areIdentified = true;

  devices.forEach((device) => {
    if (device.kind === 'videoinput') {
      if (!webcams.some((d) => d.deviceId === device.deviceId)) {
        // We found a priority device. Push it to the beginning of the array so we
        // can use it as the "initial device"
        if (priorityDevice && priorityDevice === device.deviceId) {
          webcams.unshift(device);
        } else {
          webcams.push(device);
        }

        if (!device.label) { areLabelled = false; }
        if (!device.deviceId) { areIdentified = false; }
      }
    }
  });

  // Returns the list of devices and whether they are labelled and identified with deviceId
  return {
    webcams,
    areLabelled,
    areIdentified,
  };
};

const _retry = (foo, opts) => new Promise((resolve, reject) => {
  const {
    retries = 1,
    delay = 0,
    error: bubbledError,
    errorRetryList = [],
  } = opts;

  if (!retries) return reject(bubbledError);

  return foo().then(resolve).catch((_error) => {
    if (errorRetryList.length > 0
      && !errorRetryList.some((eName) => _error.name === eName)) {
      reject(_error);
      return;
    }

    const newOpts = {
      ...opts,
      retries: retries - 1,
      error: _error,
    };

    setTimeout(() => {
      _retry(foo, newOpts).then(resolve).catch(reject);
    }, delay);
  });
});

// Returns a promise that resolves an instance of BBBVideoStream or rejects an *Error
const doGUM = (deviceId, profile) => {
  const GUM_TIMEOUT = window.meetingClientSettings.public.kurento.gUMTimeout;

  // Check if this is an already loaded stream
  if (deviceId && hasStream(deviceId)) {
    return Promise.resolve(getStream(deviceId));
  }

  const constraints = {
    audio: false,
    video: { ...profile.constraints },
  };

  if (deviceId) {
    constraints.video.deviceId = { exact: deviceId };
  }

  const postProcessedgUM = (cts) => {
    const ppGUM = () => navigator.mediaDevices.getUserMedia(cts)
      .then((stream) => new BBBVideoStream(stream));

    // Chrome/Edge sometimes bork gUM calls when switching camera
    // profiles. This looks like a browser bug. Track release not
    // being done synchronously -> quick subsequent gUM calls for the same
    // device (profile switching) -> device becoming unavailable while previous
    // tracks aren't finished - prlanzarin
    if (browserInfo.isChrome || browserInfo.isEdge) {
      const opts = {
        retries: GUM_MAX_RETRIES,
        errorRetryList: ['NotReadableError'],
        delay: GUM_RETRY_DELAY,
      };
      return _retry(ppGUM, opts);
    }

    return ppGUM();
  };

  return promiseTimeout(GUM_TIMEOUT, postProcessedgUM(constraints));
};

const terminateCameraStream = (bbbVideoStream, deviceId) => {
  // Cleanup current stream if it wasn't shared/stored
  if (bbbVideoStream && !hasStream(deviceId)) {
    bbbVideoStream.stop();
  }
};

export default {
  promiseTimeout,
  changeWebcam: (deviceId) => {
    getStorageSingletonInstance().setItem('WebcamDeviceId', deviceId);
  },
  webcamDeviceId: () => getStorageSingletonInstance().getItem('WebcamDeviceId'),
  clearWebcamDeviceId: () => getStorageSingletonInstance().removeItem('WebcamDeviceId'),
  changeProfile: (profileId) => {
    getStorageSingletonInstance().setItem('WebcamProfileId', profileId);
  },
  webcamProfileId: () => getStorageSingletonInstance().getItem('WebcamProfileId'),
  clearWebcamProfileId: () => getStorageSingletonInstance().removeItem('WebcamProfileId'),
  getSkipVideoPreview,
  storeStream,
  getStream,
  hasStream,
  deleteStream,
  clearStreams,
  digestVideoDevices,
  getDefaultProfile,
  getCameraAsContentProfile,
  getCameraProfile,
  doGUM,
  terminateCameraStream,
};
