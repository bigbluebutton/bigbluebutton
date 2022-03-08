import Pads, { PadsUpdates } from '/imports/api/pads';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import axios from 'axios';

const PADS_CONFIG = Meteor.settings.public.pads;
const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

const getLang = () => {
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getParams = () => {
  const config = {};
  config.lang = getLang();
  config.rtl = document.documentElement.getAttribute('dir') === 'rtl';

  const params = Object.keys(config)
    .map((key) => `${key}=${encodeURIComponent(config[key])}`)
    .join('&');
  return params;
};

const getPadId = (externalId) => makeCall('getPadId', externalId);

const createGroup = (externalId, model, name) => makeCall('createGroup', externalId, model, name);

const hasPad = (externalId) => {
  const pad = Pads.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    },
  );

  return pad !== undefined;
};

const createSession = (externalId) => makeCall('createSession', externalId);

const buildPadURL = (padId) => {
  if (padId) {
    const params = getParams();
    const url = Auth.authenticateURL(`${PADS_CONFIG.url}/p/${padId}?${params}`);
    return url;
  }

  return null;
};

const getRev = (externalId) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { rev: 1 } },
  );

  return updates ? updates.rev : 0;
};

const getPadTail = (externalId) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { tail: 1 } },
  );

  if (updates && updates.tail) return updates.tail;

  return '';
};

const getPadContent = (externalId) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { content: 1 } },
  );

  if (updates && updates.content) return updates.content;

  return '';
};

async function convertAndUpload(externalId) {
  const padId = await makeCall('getPadId', externalId);

  // Build export URL in the desired format
  const params = getParams();
  
  // This returns a blank PDF
  const exportUrl = Auth.authenticateURL(`${PADS_CONFIG.url}/p/${padId}/export/pdf?${params}`);

  // This returns 403 forbidden
  // const exportUrl = `${PADS_CONFIG.notes_endpoint}/${padId}/export/pdf`;

  console.log(exportUrl);
  console.log(`${PADS_CONFIG.notes_endpoint}/${padId}/export/pdf`)

  let exportedSharedNotes = await axios({
    method: 'get',
    url: exportUrl,
    responseType: 'json',
  });

  if (exportedSharedNotes.status != 200) {
    return null;
  }

  let sharedNotesData = new File([exportedSharedNotes.data], "SharedNotes.pdf", { lastModified: Date.now, type: 'application/pdf' });
  let presentationUploadToken = await PresentationUploaderService.requestPresentationUploadToken('DEFAULT_PRESENTATION_POD', Auth.meetingID, "SharedNotes.pdf");

  let formData = new FormData();

  formData.append('presentation_name', 'SharedNotes.pdf');
  formData.append('Filename', 'SharedNotes.pdf');
  formData.append('conference', Auth.meetingID);
  formData.append('room', Auth.meetingID);
  formData.append('pod_id', 'DEFAULT_PRESENTATION_POD');
  formData.append('is_downloadable', false);
  formData.append('fileUpload', sharedNotesData);

  axios({
    method: "post",
    url: PRESENTATION_CONFIG.uploadEndpoint.replace('upload', `${presentationUploadToken}/upload`),
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return null;
}

export default {
  getPadId,
  createGroup,
  hasPad,
  createSession,
  buildPadURL,
  getRev,
  getPadTail,
  getPadContent,
  convertAndUpload,
};
