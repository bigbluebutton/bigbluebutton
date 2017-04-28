import Presentations from '/imports/api/presentations';
import Auth from '/imports/ui/services/auth';

import { callServer } from '/imports/ui/services/api';

const PRESENTATION_UPLOAD_ENDPOINT = '/bigbluebutton/presentation/upload';

const getPresentations = () =>
  Presentations
    .find()
    .fetch()
    .map(p => ({
      _id: p._id,
      id: p.presentation.id,
      filename: p.presentation.name,
      uploadedAt: new Date(),
      isCurrent: p.presentation.current,
      isUploaded: true,
      isProcessed: true,
    }));

const uploadPresentation = file => {
  var data = new FormData();
  data.append('file', file);
  data.append('conference', Auth.meetingID);
  data.append('room', Auth.meetingID);

  return fetch(PRESENTATION_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: data,
  });
};

const updatePresentations = newState => {

};

export default {
  getPresentations,
  updatePresentations,
};
