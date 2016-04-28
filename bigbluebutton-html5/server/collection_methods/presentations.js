import { Presentations, Slides } from '/collections/collections';

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

    //Meteor.log.info "presentation added id =[#{id}]:#{presentationObject.id} in #{meetingId}. Presentations.size
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
      }, Meteor.log.info(`cleared Slides Collection (presentationId: ${presentationId}!`));
    Presentations.remove(presentationObject._id);
    return Meteor.log.info(`----removed presentation[${presentationId}] from ${meetingId}`);
  }
};

// called on server start and meeting end
export function clearPresentationsCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Presentations.remove({
      meetingId: meetingId,
    }, Meteor.log.info(`cleared Presentations Collection (meetingId: ${meetingId}!`));
  } else {
    return Presentations.remove({}, Meteor.log.info('cleared Presentations Collection (all meetings)!'));
  }
};
