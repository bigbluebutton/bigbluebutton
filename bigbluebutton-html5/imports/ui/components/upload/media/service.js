const MEDIA_UPLOAD = Meteor.settings.public.upload.media;

const isEnabled = () => {
  return MEDIA_UPLOAD.enabled;
};

const getSource = () => {
  return MEDIA_UPLOAD.source;
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
  getSource,
  getMaxSize,
  getMediaValidFiles,
  getMediaFiles,
};
