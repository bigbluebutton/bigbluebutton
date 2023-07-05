import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Presentations from '/imports/api/presentations';

// const OFFICE_DOC_CONVERSION_SUCCESS_KEY = 'OFFICE_DOC_CONVERSION_SUCCESS';
const OFFICE_DOC_CONVERSION_FAILED_KEY = 'OFFICE_DOC_CONVERSION_FAILED';
const OFFICE_DOC_CONVERSION_INVALID_KEY = 'OFFICE_DOC_CONVERSION_INVALID';
const SUPPORTED_DOCUMENT_KEY = 'SUPPORTED_DOCUMENT';
const UNSUPPORTED_DOCUMENT_KEY = 'UNSUPPORTED_DOCUMENT';
const PAGE_COUNT_FAILED_KEY = 'PAGE_COUNT_FAILED';
const PAGE_COUNT_EXCEEDED_KEY = 'PAGE_COUNT_EXCEEDED';
const PDF_HAS_BIG_PAGE_KEY = 'PDF_HAS_BIG_PAGE';
const GENERATED_SLIDE_KEY = 'GENERATED_SLIDE';
const FILE_TOO_LARGE_KEY = 'FILE_TOO_LARGE';
const CONVERSION_TIMEOUT_KEY = 'CONVERSION_TIMEOUT';
const INVALID_MIME_TYPE_KEY = 'INVALID_MIME_TYPE';
const NO_CONTENT = '204';
// const GENERATING_THUMBNAIL_KEY = 'GENERATING_THUMBNAIL';
// const GENERATED_THUMBNAIL_KEY = 'GENERATED_THUMBNAIL';
// const GENERATING_TEXTFILES_KEY = 'GENERATING_TEXTFILES';
// const GENERATED_TEXTFILES_KEY = 'GENERATED_TEXTFILES';
// const GENERATING_SVGIMAGES_KEY = 'GENERATING_SVGIMAGES';
// const GENERATED_SVGIMAGES_KEY = 'GENERATED_SVGIMAGES';
// const CONVERSION_COMPLETED_KEY = 'CONVERSION_COMPLETED';

export default async function handlePresentationConversionUpdate({ body }, meetingId) {
  check(body, Object);

  const {
    presentationId, podId, messageKey: status, presName: presentationName, temporaryPresentationId,
  } = body;

  check(meetingId, String);
  check(presentationId, Match.Maybe(String));
  check(podId, Match.Maybe(String));
  check(status, String);
  check(temporaryPresentationId, Match.Maybe(String));

  const statusModifier = {
    'conversion.status': status,
    'conversion.error': false,
    'conversion.done': false,
  };

  switch (status) {
    case SUPPORTED_DOCUMENT_KEY:
      statusModifier.id = presentationId;
      statusModifier.name = presentationName;
      break;

    case FILE_TOO_LARGE_KEY:
      statusModifier['conversion.maxFileSize'] = body.maxFileSize;
    case UNSUPPORTED_DOCUMENT_KEY:
    case OFFICE_DOC_CONVERSION_FAILED_KEY:
    case INVALID_MIME_TYPE_KEY:
      statusModifier['conversion.error'] = true;
      statusModifier['conversion.fileMime'] = body.fileMime;
      statusModifier['conversion.fileExtension'] = body.fileExtension;
    case OFFICE_DOC_CONVERSION_INVALID_KEY:
    case PAGE_COUNT_FAILED_KEY:
    case PAGE_COUNT_EXCEEDED_KEY:
      statusModifier['conversion.maxNumberPages'] = body.maxNumberPages;
    case PDF_HAS_BIG_PAGE_KEY:
      statusModifier.id = presentationId ?? body.presentationToken;
      statusModifier.name = presentationName ?? body.presentationName;
      statusModifier['conversion.error'] = true;
      statusModifier['conversion.bigPageSize'] = body.bigPageSize;
      break;
    case CONVERSION_TIMEOUT_KEY:
      statusModifier['conversion.error'] = true;
      statusModifier['conversion.maxNumberOfAttempts'] = body.maxNumberOfAttempts;
      statusModifier['conversion.numberPageError'] = body.page;
      
      break;
    case GENERATED_SLIDE_KEY:
      statusModifier['conversion.pagesCompleted'] = body.pagesCompleted;
      statusModifier['conversion.numPages'] = body.numberOfPages;
      break;

    case NO_CONTENT:
      statusModifier['conversion.done'] = false;
      statusModifier['conversion.error'] = true;
      statusModifier.id = presentationId;
      statusModifier.name = presentationName;
      break;

    default:
      break;
  }

  const selector = {
    meetingId,
    podId,
    id: presentationId ?? body.presentationToken,
  };

  let modifier
  if (temporaryPresentationId){
    modifier = {
      $set: Object.assign({ meetingId, podId, renderedInToast: false, temporaryPresentationId, }, statusModifier),
    };
  } else {
    modifier = {
      $set: Object.assign({ meetingId, renderedInToast: false, podId }, statusModifier),
    };
  }

  try {
    const presentations = await Presentations.find(selector).fetchAsync();
    const isPresentationPersisted = await Promise.all(presentations.map(async (item) => {
      if (item.temporaryPresentationId && temporaryPresentationId) {
        return item.temporaryPresentationId === temporaryPresentationId;
      } else {
        return item.id === presentationId;
      }
    }));
    const isPersisted = isPresentationPersisted.some((item) => item === true);
    
    let insertedID;
    if (!isPersisted) {
      const { insertedId } = await Presentations.upsertAsync(selector, modifier);
      insertedID = insertedId;
    } else {
      selector['conversion.error'] = false;
      const { insertedId } = await Presentations.updateAsync(selector, modifier);
      insertedID = insertedId;
    }
  
    if (insertedID) {
      Logger.info(`Updated presentation conversion status=${status} id=${presentationId} meeting=${meetingId}`);
    } else {
      Logger.debug('Upserted presentation conversion', { status, presentationId, meetingId });
    }
  } catch (err) {
    Logger.error(`Updating conversion status presentation to collection: ${err}`);
  }
}
