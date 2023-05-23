import Auth from '/imports/ui/services/auth';
import PresentationUploaderService from '/imports/ui/components/presentation/presentation-uploader/service';
import PadsService from '/imports/ui/components/pads/service';
import NotesService from '/imports/ui/components/notes/service';
import { UploadingPresentations } from '/imports/api/presentations';
import _ from 'lodash';

const PADS_CONFIG = Meteor.settings.public.pads;

async function convertAndUpload() {
  let filename = 'Shared_Notes';
  const presentations = PresentationUploaderService.getPresentations();
  const duplicates = presentations.filter((pres) => pres.filename?.startsWith(filename)
    || pres.name?.startsWith(filename)).length;

  if (duplicates !== 0) { filename = `${filename}(${duplicates})`; }

  const params = PadsService.getParams();
  const padId = await PadsService.getPadId(NotesService.ID);
  const extension = 'pdf';
  filename = `${filename}.${extension}`;

  UploadingPresentations.insert({
    id: _.uniqueId(filename),
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
    type: 'application/pdf',
  });

  PresentationUploaderService.handleSavePresentation([], isFromPresentationUploaderInterface = false, {
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
  pinSharedNotes: () => NotesService.pinSharedNotes(true),
};
