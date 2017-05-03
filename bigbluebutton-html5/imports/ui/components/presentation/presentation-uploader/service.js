import Presentations from '/imports/api/presentations';
import Auth from '/imports/ui/services/auth';

import { makeCall } from '/imports/ui/services/api';

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

const uploadPresentation = (file, meetingID, endpoint) => {
  var data = new FormData();
  data.append('Filename', file.filename);
  data.append('presentation_name', file.filename);
  data.append('fileUpload', file);
  data.append('conference', meetingID);
  data.append('room', meetingID);

  /* TODO: Should we do the request on the html5 server instead of the client? */
  return fetch(endpoint, {
    method: 'POST',
    body: data,
  });
};

const removePresentation = (presentationID) => {
  return makeCall('removePresentation');
};

const persistPresentationChanges = (oldState, newState, uploadEndpoint) => {
  const presentationsToUpload = newState.filter(_ => !oldState.includes(_));
  const presentationsToDelete = oldState.filter(_ => !newState.includes(_));
  return new Promise((resolve, reject) =>
    Promise.resolve().then(
      Promise.all(presentationsToUpload.map(p =>
        uploadPresentation(p.file, Auth.meetingID, uploadEndpoint)))
    ).then(
      Promise.all(presentationsToDelete.map(p => removePresentation(p.filename)))
    ).then(() => makeCall('sharePresentation'))
  );
};

export default {
  getPresentations,
  persistPresentationChanges,
};
