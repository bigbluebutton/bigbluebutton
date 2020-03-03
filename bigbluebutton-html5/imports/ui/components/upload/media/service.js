const MEDIA_UPLOAD = Meteor.settings.public.upload.media;

const isEnabled = () => {
  return MEDIA_UPLOAD.enabled;
};

const getEndpoint = () => {
  return MEDIA_UPLOAD.endpoint;
};

const getMaxSize = () => {
  return MEDIA_UPLOAD.maxSize;
};

const getMediaValidFiles = () => {
  return MEDIA_UPLOAD.validFiles;
};

// TODO: Uploaded files collection
const getMediaFiles = () => {
  return [];
};

export default {
  isEnabled,
  getEndpoint,
  getMaxSize,
  getMediaValidFiles,
  getMediaFiles,
};
