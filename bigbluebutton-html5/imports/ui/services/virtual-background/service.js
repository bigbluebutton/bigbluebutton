import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import { createVirtualBackgroundService } from '/imports/ui/services/virtual-background';
import { getStorageSingletonInstance } from '/imports/ui/services/storage';
import CustomBackgroundsService from '/imports/ui/services/virtual-background/custom-backgrounds';

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

const getBasePath = () => {
  const BASE_PATH = window.meetingClientSettings.public.app.cdn
    + window.meetingClientSettings.public.app.basename;

  return BASE_PATH;
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

  return createVirtualBackgroundService(buildParams).then(async (service) => {
    const effect = await service.startEffect(stream);
    return { service, effect };
  });
};

const getVirtualBackgroundThumbnail = (name) => {
  if (name === BLUR_FILENAME) {
    return `${getBasePath()}/resources/images/virtual-backgrounds/thumbnails/${name}`;
  }

  return (getIsStoredOnBBB() ? getBasePath() : '') + getThumbnailsPath() + name;
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

const isVirtualBackgroundSupported = () => !(deviceInfo.isIos || browserInfo.isSafari);

const loadCustomBackgrounds = () => new Promise((resolve, reject) => {
  CustomBackgroundsService.load(reject, resolve);
});

const getCustomBackgroundParams = async (uniqueId, customBackgrounds = {}) => {
  const findBackground = (backgrounds) => backgrounds[uniqueId]
    || Object.values(backgrounds).find((background) => background.uniqueId === uniqueId);
  let background = findBackground(customBackgrounds);

  if (!background?.data) {
    const storedBackgrounds = await loadCustomBackgrounds();
    background = findBackground(storedBackgrounds);
  }

  if (!background?.data) throw new Error('Missing virtual background data');
  return { uniqueId, file: background.data };
};

const applyStoredEffects = async (bbbVideoStream, deviceId, { customBackgrounds = {} } = {}) => {
  const storedVirtualBackground = getSessionVirtualBackgroundInfo(deviceId);
  const virtualBackground = storedVirtualBackground || customBackgrounds.webcamBackgroundURL;
  const cameraBrightnessAvailable = window.meetingClientSettings.public.app.enableCameraBrightness
    && isVirtualBackgroundSupported();
  const cameraBrightness = cameraBrightnessAvailable ? getCameraBrightnessInfo(deviceId) : null;

  // A stored {type:'none'} is a user who explicitly picked "None": it is a truthy value that asks
  // for no effect at all. Mirrors the predicate the preview applies on an interactive selection.
  const wantsVirtualBackground = !!virtualBackground
    && virtualBackground.type !== EFFECT_TYPES.NONE_TYPE;
  const wantsBrightnessEffect = !!cameraBrightness
    && (cameraBrightness.brightness !== 100 || cameraBrightness.wholeImageBrightness);

  if (wantsVirtualBackground) {
    const {
      type, name, filename, uniqueId,
    } = virtualBackground;
    const customParams = uniqueId
      ? await getCustomBackgroundParams(uniqueId, customBackgrounds)
      : undefined;
    await bbbVideoStream.startVirtualBackground(type, name || filename, customParams);
  } else if (wantsBrightnessEffect) {
    await bbbVideoStream.startVirtualBackground(EFFECT_TYPES.NONE_TYPE);
  }

  if (cameraBrightness) {
    bbbVideoStream.changeCameraBrightness(cameraBrightness.brightness);
    bbbVideoStream.toggleCameraBrightnessArea(cameraBrightness.wholeImageBrightness);
  }

  // Report what was applied, not what was stored: callers use this to decide whether a background
  // is active, and "None" is not one.
  return {
    virtualBackground: wantsVirtualBackground ? virtualBackground : null,
    cameraBrightness,
  };
};

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

const getVirtualBgImagePath = () => {
  const {
    imagesPath: IMAGES_PATH = '/resources/images/virtual-backgrounds/',
  } = window.meetingClientSettings.public.virtualBackgrounds;

  return (getIsStoredOnBBB() ? getBasePath() : '') + IMAGES_PATH;
};

export {
  getBasePath,
  getImageNames,
  MODELS,
  BLUR_FILENAME,
  EFFECT_TYPES,
  setSessionVirtualBackgroundInfo,
  setCameraBrightnessInfo,
  getSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfoWithDefault,
  getCameraBrightnessInfo,
  applyStoredEffects,
  getCameraBrightnessInfoWithDefault,
  removeSessionVirtualBackgroundInfo,
  isVirtualBackgroundSupported,
  createVirtualBackgroundStream,
  getVirtualBackgroundThumbnail,
  getVirtualBgImagePath,
};
