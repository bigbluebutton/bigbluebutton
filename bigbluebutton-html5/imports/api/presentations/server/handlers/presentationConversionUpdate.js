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
// const GENERATING_THUMBNAIL_KEY = 'GENERATING_THUMBNAIL';
// const GENERATED_THUMBNAIL_KEY = 'GENERATED_THUMBNAIL';
// const GENERATING_TEXTFILES_KEY = 'GENERATING_TEXTFILES';
// const GENERATED_TEXTFILES_KEY = 'GENERATED_TEXTFILES';
// const GENERATING_SVGIMAGES_KEY = 'GENERATING_SVGIMAGES';
// const GENERATED_SVGIMAGES_KEY = 'GENERATED_SVGIMAGES';
// const CONVERSION_COMPLETED_KEY = 'CONVERSION_COMPLETED';

export default function handlePresentationConversionUpdate({ body }, meetingId) {
  check(body, Object);

  const {
    presentationId, podId, messageKey: status, presName: presentationName,
  } = body;

  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);
  check(status, String);

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

    case UNSUPPORTED_DOCUMENT_KEY:
    case OFFICE_DOC_CONVERSION_FAILED_KEY:
    case OFFICE_DOC_CONVERSION_INVALID_KEY:
    case PAGE_COUNT_FAILED_KEY:
    case PAGE_COUNT_EXCEEDED_KEY:
    case PDF_HAS_BIG_PAGE_KEY:
      statusModifier.id = presentationId;
      statusModifier.name = presentationName;
      statusModifier['conversion.error'] = true;
      break;

    case GENERATED_SLIDE_KEY:
      statusModifier['conversion.pagesCompleted'] = body.pagesCompleted;
      statusModifier['conversion.numPages'] = body.numberOfPages;
      break;

    default:
      break;
  }

  const selector = {
    meetingId,
    podId,
    id: presentationId,
  };

  const modifier = {
    $set: Object.assign({ meetingId, podId }, statusModifier),
  };

  try {
    const { insertedId } = Presentations.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Updated presentation conversion status=${status} id=${presentationId} meeting=${meetingId}`);
    } else {
      Logger.debug('Upserted presentation conversion', { status, presentationId, meetingId });
    }
  } catch (err) {
    Logger.error(`Updating conversion status presentation to collection: ${err}`);
  }
}
