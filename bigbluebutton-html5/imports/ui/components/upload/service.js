import Upload from '/imports/api/upload';
import { makeCall } from '/imports/ui/services/api';

const requestUpload = (source, filename) => {
  makeCall('requestUpload', source, filename);
};

export default {
  requestUpload,
};
