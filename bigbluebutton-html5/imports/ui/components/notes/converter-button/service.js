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
  const temporaryPresentationId = _.uniqueId(Random.id(20));

  const sharedNotesData = new File([data], `${filename}.${extension}`, {
    type: data.type,
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
    onConversion: () => {},
    onUpload: () => {},
    onProgress: () => {},
    onDone: () => {},
  })
}

export default {
  convertAndUpload,
};
