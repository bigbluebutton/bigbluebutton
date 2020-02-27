const MEDIA_UPLOAD = Meteor.settings.public.upload.media;

const isEnabled = () => {
  return MEDIA_UPLOAD.enabled;
};

const getMinSize = () => {
  return MEDIA_UPLOAD.size.min;
};

const getMaxSize = () => {
  return MEDIA_UPLOAD.size.max;
};

const getMediaTypes = () => {
  return MEDIA_UPLOAD.types;
};

export default {
  isEnabled,
  getMinSize,
  getMaxSize,
  getMediaTypes,
};
