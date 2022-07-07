import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import { createVirtualBackgroundService } from '/imports/ui/services/virtual-background';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';

const BLUR_FILENAME = 'blur.jpg';
const EFFECT_TYPES = {
  BLUR_TYPE: 'blur',
  IMAGE_TYPE: 'image',
  NONE_TYPE: 'none',
}

// TODO I'm sure this is centralized somewhere; fetch it from "there" if possible
const BASE_PATH = Meteor.settings.public.app.cdn
  + Meteor.settings.public.app.basename
  + Meteor.settings.public.app.instanceId;

const MODELS = {
  model96: {
    path: '/resources/tfmodels/segm_lite_v681.tflite',
    segmentationDimensions: {
        height: 96,
        width: 160
    }
  },
  model144: {
    path: '/resources/tfmodels/segm_full_v679.tflite',
    segmentationDimensions: {
        height: 144,
        width: 256
    }
  },
};

const {
  thumbnailsPath: THUMBNAILS_PATH = '/resources/images/virtual-backgrounds/thumbnails/',
  fileNames: IMAGE_NAMES = ['home.jpg', 'coffeeshop.jpg', 'board.jpg'],
  storedOnBBB: IS_STORED_ON_BBB = true,
  imagesPath: IMAGES_PATH = '/resources/images/virtual-backgrounds/',
  showThumbnails: SHOW_THUMBNAILS = true,
} = Meteor.settings.public.virtualBackgrounds;

const createVirtualBackgroundStream = (type, name, isVirtualBackground, stream) => {
  const buildParams = {
    backgroundType: type,
    backgroundFilename: name,
    isVirtualBackground,
  }

  return createVirtualBackgroundService(buildParams).then((service) => {
    const effect = service.startEffect(stream)
    return { service, effect };
  });
}

const getVirtualBackgroundThumbnail = (name) => {
  if (name === BLUR_FILENAME) {
    return BASE_PATH + '/resources/images/virtual-backgrounds/thumbnails/' + name;
  }

  return (IS_STORED_ON_BBB ? BASE_PATH : '') + THUMBNAILS_PATH + name;
}

// Stores the last chosen camera effect into the session storage in the following format:
// {
//   type: <EFFECT_TYPES>,
//   name: effect filename, if any
// }
const setSessionVirtualBackgroundInfo = (type, name, deviceId) => {
  return Session.set(`VirtualBackgroundInfo_${deviceId}`, { type, name });
}

const getSessionVirtualBackgroundInfo = (deviceId) => {
  return Session.get(`VirtualBackgroundInfo_${deviceId}`) || {
    type: EFFECT_TYPES.NONE_TYPE,
  };
}

const getSessionVirtualBackgroundInfoWithDefault = (deviceId) => {
  return Session.get(`VirtualBackgroundInfo_${deviceId}`) || {
    type: EFFECT_TYPES.BLUR_TYPE,
    name: BLUR_FILENAME,
  };
}

const isVirtualBackgroundSupported = () => {
  return !(deviceInfo.isIos || browserInfo.isSafari);
}

const getVirtualBgImagePath = () => {
  return (IS_STORED_ON_BBB ? BASE_PATH : '') + IMAGES_PATH;
}

export {
  BASE_PATH,
  MODELS,
  THUMBNAILS_PATH,
  SHOW_THUMBNAILS,
  IMAGE_NAMES,
  IS_STORED_ON_BBB,
  IMAGES_PATH,
  BLUR_FILENAME,
  EFFECT_TYPES,
  setSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfoWithDefault,
  isVirtualBackgroundSupported,
  createVirtualBackgroundStream,
  getVirtualBackgroundThumbnail,
  getVirtualBgImagePath,
}
