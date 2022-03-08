import Pads, { PadsUpdates } from '/imports/api/pads';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import axios from 'axios';

const PADS_CONFIG = Meteor.settings.public.pads;

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
  const exportUrl = Auth.authenticateURL(`${PADS_CONFIG.url}/p/${padId}/export/pdf?${params}`);

  console.log(exportUrl);

  let exportedSharedNotes = await axios({
    method: 'get',
    url: exportUrl,
    responseType: 'json',
  });

  if (exportedSharedNotes.status != 200) {
    return null;
  }

  let file = new File([exportedSharedNotes.data], "SharedNotes.pdf", { lastModified: Date.now, type: 'application/pdf' });

  // PresentationUploaderService.uploadAndConvertPresentation(
  //   file,
  //   false,
  //   'DEFAULT_PRESENTATION_POD',
  //   Auth.meetingID,
  //   PRESENTATION_CONFIG.uploadEndpoint,
  //   { done: false, error: false, progress: 0 },
  //   { done: false, error: false },
  //   { done: false, error: false, status: '' },
  // );

  let presentationUploadToken = await PresentationUploaderService.requestPresentationUploadToken('DEFAULT_PRESENTATION_POD', Auth.meetingID, 'SharedNotes.pdf');

  let callbackUrl = `http://127.0.0.1:8090/bigbluebutton/presentation/${presentationUploadToken}/upload`;
  let formData = new FormData();

  formData.append('presentation_name', 'SharedNotes.pdf');
  formData.append('Filename', 'SharedNotes.pdf');
  formData.append('conference', Auth.meetingID);
  formData.append('room', Auth.meetingID);
  formData.append('pod_id', 'DEFAULT_PRESENTATION_POD');
  formData.append('is_downloadable', false);
  
  // formData.append('fileUpload', file);

  let res = await axios({
    method: "post",
    url: callbackUrl,
    fileUpload: file,
    headers: { "Content-Type": "multipart/form-data" },
  });

  console.log(res.data);

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
