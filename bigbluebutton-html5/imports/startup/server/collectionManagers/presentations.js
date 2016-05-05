import { Presentations, Slides } from '/collections/collections';
import { logger } from '/imports/startup/server/logger';

export function addPresentationToCollection(meetingId, presentationObject) {
  let entry, id, presentationObj;

  //check if the presentation is already in the collection
  presentationObj = Presentations.findOne({
    meetingId: meetingId,
    'presentation.id': presentationObject.id,
  });
  if (presentationObj == null) {
    entry = {
      meetingId: meetingId,
      presentation: {
        id: presentationObject.id,
        name: presentationObject.name,
        current: presentationObject.current,
      },
    };
    return id = Presentations.insert(entry);

    //logger.info "presentation added id =[#{id}]:#{presentationObject.id} in #{meetingId}. Presentations.size
    // is now #{Presentations.find({meetingId: meetingId}).count()}"
  }
};

export function removePresentationFromCollection(meetingId, presentationId) {
  let id, presentationObject;
  presentationObject = Presentations.findOne({
    meetingId: meetingId,
    'presentation.id': presentationId,
  });
  if (presentationObject != null) {
    Slides.remove({
        presentationId: presentationId,
      }, logger.info(`cleared Slides Collection (presentationId: ${presentationId}!`));
    Presentations.remove(presentationObject._id);
    return logger.info(`----removed presentation[${presentationId}] from ${meetingId}`);
  }
};

// called on server start and meeting end
export function clearPresentationsCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Presentations.remove({
      meetingId: meetingId,
    }, logger.info(`cleared Presentations Collection (meetingId: ${meetingId}!`));
  } else {
    return Presentations.remove({}, logger.info('cleared Presentations Collection (all meetings)!'));
  }
};
