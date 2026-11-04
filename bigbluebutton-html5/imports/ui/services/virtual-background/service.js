import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import { createVirtualBackgroundService } from '/imports/ui/services/virtual-background';
import { getStorageSingletonInstance } from '/imports/ui/services/storage';
import { assetUrl } from '/imports/ui/services/url-builder';

const BLUR_FILENAME = 'blur.jpg';
const EFFECT_TYPES = {
  BLUR_TYPE: 'blur',
  IMAGE_TYPE: 'image',
  NONE_TYPE: 'none',
};

const MODELS = {
  model96: {
    path: '/resources/tfmodels/segm_lite_v681.tflite',
    segmentationDimensions: {
      height: 96,
      width: 160,
    },
  },
  model144: {
    path: '/resources/tfmodels/segm_full_v679.tflite',
    segmentationDimensions: {
      height: 144,
      width: 256,
    },
  },
};

const getThumbnailsPath = () => {
  const {
    thumbnailsPath: THUMBNAILS_PATH = '/resources/images/virtual-backgrounds/thumbnails/',
  } = window.meetingClientSettings.public.virtualBackgrounds;

  return THUMBNAILS_PATH;
};

const getImageNames = () => {
  const {
    fileNames: IMAGE_NAMES = ['home.jpg', 'coffeeshop.jpg', 'board.jpg'],
  } = window.meetingClientSettings.public.virtualBackgrounds;

  return IMAGE_NAMES;
};

const getIsStoredOnBBB = () => {
  const {
    storedOnBBB: IS_STORED_ON_BBB = true,
  } = window.meetingClientSettings.public.virtualBackgrounds;

  return IS_STORED_ON_BBB;
};

const createVirtualBackgroundStream = (type, name, isVirtualBackground, stream, customParams) => {
  const buildParams = {
    backgroundType: type,
    backgroundFilename: name,
    isVirtualBackground,
    customParams,
  };

  return createVirtualBackgroundService(buildParams).then((service) => {
    const effect = service.startEffect(stream);
    return { service, effect };
  });
};

const getVirtualBackgroundThumbnail = (name) => {
  if (name === BLUR_FILENAME) {
    return assetUrl(`resources/images/virtual-backgrounds/thumbnails/${name}`);
  }

  if (!getIsStoredOnBBB()) {
    return getThumbnailsPath() + name;
  }

  const thumbPath = getThumbnailsPath().replace(/^\//, '');
  return assetUrl(`${thumbPath}${name}`);
};

// Stores the last chosen camera effect into the session storage in the following format:
// {
//   type: <EFFECT_TYPES>,
//   name: effect filename, if any
// }
const setSessionVirtualBackgroundInfo = (deviceId, type, name, uniqueId = null) => {
  getStorageSingletonInstance().setItem(`VirtualBackgroundInfo_${deviceId}`, { type, name, uniqueId });
};

const setCameraBrightnessInfo = (deviceId, brightness, wholeImageBrightness) => {
  getStorageSingletonInstance().setItem(`CameraBrightnessInfo_${deviceId}`, { brightness, wholeImageBrightness });
};

/**
 * @param {string} deviceId
 * @returns {{type: string, name: string, uniqueId: (string | null)} | null}
 */
const getSessionVirtualBackgroundInfo = (deviceId) => getStorageSingletonInstance().getItem(`VirtualBackgroundInfo_${deviceId}`);

const getCameraBrightnessInfo = (deviceId) => getStorageSingletonInstance().getItem(`CameraBrightnessInfo_${deviceId}`);

/**
 * @param {string} deviceId
 * @returns {{brightness: number, wholeImageBrightness: boolean}}
 */
const getCameraBrightnessInfoWithDefault = (deviceId) => getStorageSingletonInstance()
  .getItem(`CameraBrightnessInfo_${deviceId}`) || {
  brightness: 100,
  wholeImageBrightness: false,
};

const getSessionVirtualBackgroundInfoWithDefault = (deviceId) => getStorageSingletonInstance()
  .getItem(`VirtualBackgroundInfo_${deviceId}`) || {
  type: EFFECT_TYPES.NONE_TYPE,
  name: EFFECT_TYPES.NONE_TYPE,
};

const removeSessionVirtualBackgroundInfo = (deviceId) => getStorageSingletonInstance()
  .removeItem(`VirtualBackgroundInfo_${deviceId}`);

const isVirtualBackgroundSupported = () => !(deviceInfo.isIos || browserInfo.isSafari);

/** Full URL for a VB image (versioned when stored on the BBB node). */
const getVirtualBgImageUrl = (filename) => {
  const {
    imagesPath: IMAGES_PATH = '/resources/images/virtual-backgrounds/',
  } = window.meetingClientSettings.public.virtualBackgrounds;

  if (!getIsStoredOnBBB()) {
    return IMAGES_PATH + filename;
  }
  return assetUrl(`${IMAGES_PATH.replace(/^\//, '')}${filename}`);
};

export {
  getImageNames,
  MODELS,
  BLUR_FILENAME,
  EFFECT_TYPES,
  setSessionVirtualBackgroundInfo,
  setCameraBrightnessInfo,
  getSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfoWithDefault,
  removeSessionVirtualBackgroundInfo,
  isVirtualBackgroundSupported,
  createVirtualBackgroundStream,
  getVirtualBackgroundThumbnail,
  getCameraBrightnessInfo,
  getCameraBrightnessInfoWithDefault,
  getVirtualBgImageUrl,
};
