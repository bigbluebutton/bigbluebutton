import { UploadedFile } from '/imports/api/upload';
import Auth from '/imports/ui/services/auth';

const MEDIA_UPLOAD = Meteor.settings.public.upload.media;
const DOWNLOAD = Meteor.settings.public.download;

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

const getMediaFiles = () => {
  return UploadedFile.find({
    meetingId: Auth.meetingID,
    source: MEDIA_UPLOAD.source,
  }).fetch()
};

const getDownloadURL = id => {
  return Auth.authenticateURL(`${DOWNLOAD.endpoint}/${MEDIA_UPLOAD.source}/${id}`);
}

export default {
  isEnabled,
  getSource,
  getMaxSize,
  getMediaValidFiles,
  getMediaFiles,
  getDownloadURL,
};
