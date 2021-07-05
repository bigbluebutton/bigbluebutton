import Storage from '/imports/ui/services/storage/session';
import getFromUserSettings from '/imports/ui/services/users-settings';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import VideoService from '/imports/ui/components/video-provider/service';

const GUM_TIMEOUT = Meteor.settings.public.kurento.gUMTimeout;
// Unfiltered, includes hidden profiles
const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles || [];
// Filtered, without hidden profiles
const PREVIEW_CAMERA_PROFILES = CAMERA_PROFILES.filter(p => !p.hidden);

const getDefaultProfile = () => {
  return CAMERA_PROFILES.find(profile => profile.id === VideoService.getUserParameterProfile())
    || CAMERA_PROFILES.find(profile => profile.default)
    || CAMERA_PROFILES[0];
}

const getCameraProfile = (id) => {
  return CAMERA_PROFILES.find(profile => profile.id === id);
}

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
  const cleanup = () => {
    deleteStream(deviceId)
  }

  // Dirty, but effective way of checking whether the browser supports the 'inactive'
  // event. If the oninactive interface is null, it can be overridden === supported.
  // If undefined, it's not; so we fallback to the track 'ended' event.
  if (stream.oninactive === null) {
    stream.addEventListener('inactive', cleanup, { once: true });
  } else {
    const track = MediaStreamUtils.getVideoTracks(stream)[0];
    if (track) {
      track.addEventListener('ended', cleanup, { once: true });
      // Extra safeguard: Firefox doesn't fire the 'ended' when it should
      // but it invokes the callback (?), so hook up to both
      track.onended = cleanup;
    }
  }

  return true;
}

const getStream = (deviceId) => {
  return VIDEO_STREAM_STORAGE.get(deviceId);
}

const hasStream = (deviceId) => {
  return VIDEO_STREAM_STORAGE.has(deviceId);
}

const deleteStream = (deviceId) => {
  const stream = getStream(deviceId);
  if (stream == null) return false;
  MediaStreamUtils.stopMediaStreamTracks(stream);
  return VIDEO_STREAM_STORAGE.delete(deviceId);
}

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
  const KURENTO_CONFIG = Meteor.settings.public.kurento;

  const skipVideoPreviewOnFirstJoin = getFromUserSettings(
    'bbb_skip_video_preview_on_first_join',
    KURENTO_CONFIG.skipVideoPreviewOnFirstJoin,
  );
  const skipVideoPreview = getFromUserSettings(
    'bbb_skip_video_preview',
    KURENTO_CONFIG.skipVideoPreview,
  );

  return (
    (Storage.getItem('isFirstJoin') !== false && skipVideoPreviewOnFirstJoin)
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
      if (!webcams.some(d => d.deviceId === device.deviceId)) {
        // We found a priority device. Push it to the beginning of the array so we
        // can use it as the "initial device"
        if (priorityDevice && priorityDevice === device.deviceId) {
          webcams.unshift(device);
        } else {
          webcams.push(device);
        }

        if (!device.label) { areLabelled = false }
        if (!device.deviceId) { areIdentified = false }
      }
    }
  });

  // Returns the list of devices and whether they are labelled and identified with deviceId
  return {
    webcams,
    areLabelled,
    areIdentified,
  };
}

const doGUM = (deviceId, profile) => {
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

  return promiseTimeout(GUM_TIMEOUT, navigator.mediaDevices.getUserMedia(constraints));
}

const terminateCameraStream = (stream, deviceId) => {
  // Cleanup current stream if it wasn't shared/stored
  if (stream && !hasStream(deviceId)) {
    MediaStreamUtils.stopMediaStreamTracks(stream);
  }
}

export default {
  PREVIEW_CAMERA_PROFILES,
  CAMERA_PROFILES,
  promiseTimeout,
  changeWebcam: (deviceId) => {
    Session.set('WebcamDeviceId', deviceId);
  },
  webcamDeviceId: () => Session.get('WebcamDeviceId'),
  changeProfile: (profileId) => {
    Session.set('WebcamProfileId', profileId);
  },
  getSkipVideoPreview,
  storeStream,
  getStream,
  hasStream,
  deleteStream,
  digestVideoDevices,
  getDefaultProfile,
  getCameraProfile,
  doGUM,
  terminateCameraStream,
};
