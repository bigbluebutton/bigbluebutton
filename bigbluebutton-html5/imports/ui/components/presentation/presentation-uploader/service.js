import Presentations from '/imports/api/presentations';
import Auth from '/imports/ui/services/auth';

import { call } from '/imports/ui/services/api';

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

const uploadPresentations = (presentationsToUpload, meetingID, uploadEndpoint) =>
  Promise.all(
    presentationsToUpload
      .map(p => uploadPresentation(p.file, meetingID, uploadEndpoint))
  );

const removePresentation = presentationID => call('removePresentation', presentationID);

const removePresentations = presentationsToRemove =>
  Promise.all(presentationsToRemove.map(p => removePresentation(p.id)));

const persistPresentationChanges = (oldState, newState, uploadEndpoint) => {
  const presentationsToUpload = newState.filter(_ => !oldState.includes(_));
  const presentationsToRemove = oldState.filter(_ => !newState.includes(_));
  const currentPresentation = newState.find(_ => _.isCurrent);

  return new Promise((resolve, reject) =>
    uploadPresentations(presentationsToUpload, Auth.meetingID, uploadEndpoint)
    .then(removePresentations.bind(null, presentationsToRemove))
    .then(call.bind(null, 'sharePresentation', currentPresentation.id, true))
    .then(resolve)
    .catch(reject)
  );
};

export default {
  getPresentations,
  persistPresentationChanges,
};
