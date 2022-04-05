import Auth from '/imports/ui/services/auth';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PadsService from '/imports/ui/components/pads/service';
import NotesService from '/imports/ui/components/notes/service';
import { makeCall } from '/imports/ui/services/api';

const PADS_CONFIG = Meteor.settings.public.pads;
const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

async function convertAndUpload() {
  const params = PadsService.getParams();

  const padId = await PadsService.getPadId(NotesService.ID);

  const exportUrl = Auth.authenticateURL(`${PADS_CONFIG.url}/p/${padId}/export/pdf?${params}`);
  const sharedNotesAsPdf = await fetch(exportUrl, { credentials: 'include' });
  const data = await sharedNotesAsPdf.blob();

  const sharedNotesData = new File([data], 'SharedNotes.pdf', {
    type: data.type,
  });

  const formData = new FormData();

  formData.append('presentation_name', 'SharedNotes.pdf');
  formData.append('Filename', 'SharedNotes.pdf');
  formData.append('conference', Auth.meetingID);
  formData.append('room', Auth.meetingID);
  formData.append('pod_id', 'DEFAULT_PRESENTATION_POD');
  formData.append('is_downloadable', false);
  formData.append('current', true);
  formData.append('fileUpload', sharedNotesData);

  const presentationUploadToken = await PresentationUploaderService.requestPresentationUploadToken('DEFAULT_PRESENTATION_POD', Auth.meetingID, 'SharedNotes.pdf');

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
