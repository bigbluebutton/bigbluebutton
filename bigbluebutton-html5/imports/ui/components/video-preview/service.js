import Storage from '/imports/ui/services/storage/session';
import getFromUserSettings from '/imports/ui/services/users-settings';

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

export default {
  promiseTimeout,
  changeWebcam: (deviceId) => {
    Session.set('WebcamDeviceId', deviceId);
  },
  webcamDeviceId: () => Session.get('WebcamDeviceId'),
  changeProfile: (profileId) => {
    Session.set('WebcamProfileId', profileId);
  },
  getSkipVideoPreview,
};
