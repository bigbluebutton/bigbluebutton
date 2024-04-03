import Auth from '/imports/ui/services/auth';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PadsService from '/imports/ui/components/pads/pads-graphql/service';
import { UploadingPresentations } from '/imports/api/presentations';
import { uniqueId } from '/imports/utils/string-utils';

const PADS_CONFIG = window.meetingClientSettings.public.pads;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function convertAndUpload(presentations: any, padId: string) {
  let filename = 'Shared_Notes';
  const duplicates = presentations.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pres: any) => pres.filename?.startsWith(filename) || pres.name?.startsWith(filename),
  ).length;

  if (duplicates !== 0) { filename = `${filename}(${duplicates})`; }

  const params = PadsService.getParams();
  const extension = 'pdf';
  filename = `${filename}.${extension}`;

  UploadingPresentations.insert({
    id: uniqueId(filename),
    progress: 0,
    filename,
    lastModifiedUploader: false,
    upload: {
      done: false,
      error: false,
    },
    uploadTimestamp: new Date(),
  });

  const exportUrl = Auth.authenticateURL(`${PADS_CONFIG.url}/p/${padId}/export/${extension}?${params}`);
  const sharedNotesAsFile = await fetch(exportUrl, { credentials: 'include' });

  const data = await sharedNotesAsFile.blob();

  const sharedNotesData = new File([data], filename, {
    type: data.type,
  });

  PresentationUploaderService.handleSavePresentation([], false, {
    file: sharedNotesData,
    isDownloadable: false, // by default new presentations are set not to be downloadable
    isRemovable: true,
    filename: sharedNotesData.name,
    isCurrent: true,
    conversion: { done: false, error: false },
    upload: { done: false, error: false, progress: 0 },
    exportation: { isRunning: false, error: false },
    onConversion: () => { },
    onUpload: () => { },
    onProgress: () => { },
    onDone: () => { },
  });
}

export default {
  convertAndUpload,
};
