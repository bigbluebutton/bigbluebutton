/* eslint-disable @typescript-eslint/no-explicit-any */
import Auth from '/imports/ui/services/auth';
import PresentationUploaderService from '/imports/ui/components/actions-bar/media-area/media-sharing/presentation/service';
import { uniqueId } from '/imports/utils/string-utils';
import PadsService from '/imports/ui/components/pads/pads-graphql/service';

async function convertAndUpload(
  presentations: any,
  padId: string,
  isEtherpadEditor: boolean,
  presentationEnabled = true,
) {
  let filename = 'Shared_Notes';
  const duplicates = presentations.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pres: any) => pres.filename?.startsWith(filename) || pres.name?.startsWith(filename),
  ).length;

  if (duplicates !== 0) { filename = `${filename}(${duplicates})`; }

  const extension = 'pdf';
  filename = `${filename}.${extension}`;

  const PADS_CONFIG = window.meetingClientSettings.public.pads;
  const hocuspocusServerHostname = window.meetingClientSettings.public.sharedNotes.serverHostname
    || window.location.hostname;

  let exportUrlString;
  const params = PadsService.getParams();
  if (isEtherpadEditor) {
    exportUrlString = Auth.authenticateURL(`${PADS_CONFIG.url}/p/${padId}/export/${extension}?${params}`);
  } else {
    exportUrlString = Auth.authenticateURL(`https://${hocuspocusServerHostname}/hocuspocus/api/documents/${padId}/export/${extension}?${params}`);
  }
  const exportUrl = Auth.authenticateURL(exportUrlString);

  const sharedNotesAsFile = await fetch(exportUrl, { credentials: 'include' });

  const data = await sharedNotesAsFile.blob();

  const sharedNotesData = new File([data], filename, {
    type: data.type,
  });
  const id = uniqueId(filename);

  PresentationUploaderService.handleSavePresentation([], false, {
    file: sharedNotesData,
    presentationId: id,
    isDownloadable: false, // by default new presentations are set not to be downloadable
    isRemovable: true,
    name: sharedNotesData.name,
    current: true,
    conversion: { done: false, error: false },
    upload: { done: false, error: false, progress: 0 },
    exportation: { isRunning: false, error: false },
    onConversion: () => { },
    onUpload: () => { },
    onProgress: () => { },
    onDone: () => { },
  }, undefined, () => { }, undefined, presentationEnabled);
}

export default {
  convertAndUpload,
};
