import Auth from '/imports/ui/services/auth';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PadsService from '/imports/ui/components/pads/service';
import NotesService from '/imports/ui/components/notes/service';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';
import { Random } from 'meteor/random';

const PADS_CONFIG = Meteor.settings.public.pads;
const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

async function convertAndUpload() {
  const params = PadsService.getParams();
  const padId = await PadsService.getPadId(NotesService.ID);
  const extension = 'pdf';

  const exportUrl = Auth.authenticateURL(`${PADS_CONFIG.url}/p/${padId}/export/${extension}?${params}`);
  const sharedNotesAsFile = await fetch(exportUrl, { credentials: 'include' });

  const data = await sharedNotesAsFile.blob();

  let filename = 'Shared_Notes';
  const presentations = PresentationUploaderService.getPresentations();
  const duplicates = presentations.filter((pres) => pres.filename.startsWith(filename)).length;

  if (duplicates !== 0) { filename = `${filename}(${duplicates})`; }

  const podId = 'DEFAULT_PRESENTATION_POD';
  const tmpPresId = _.uniqueId(Random.id(20));

  const sharedNotesData = new File([data], `${filename}.${extension}`, {
    type: data.type,
  });

  const formData = new FormData();

  formData.append('conference', Auth.meetingID);
  formData.append('pod_id', podId);
  formData.append('is_downloadable', false);
  formData.append('current', true);
  formData.append('fileUpload', sharedNotesData);
  formData.append('temporaryPresentationId', tmpPresId);

  const presentationUploadToken = await PresentationUploaderService.requestPresentationUploadToken(
    tmpPresId,
    podId,
    Auth.meetingID,
    filename,
  );

  fetch(PRESENTATION_CONFIG.uploadEndpoint.replace('upload', `${presentationUploadToken}/upload`), {
    body: formData,
    method: 'post',
  });

  makeCall('setUsedToken', presentationUploadToken);
  return null;
}

export default {
  convertAndUpload,
};
