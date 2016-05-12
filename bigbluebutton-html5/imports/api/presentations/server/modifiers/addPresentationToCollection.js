import Presentations from '/imports/api/presentations/collection';

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

    //logger.info "presentation added id =[#{id}]:#{presentationObject.id} in #{meetingId}.
    // Presentations.size is now #{Presentations.find({meetingId: meetingId}).count()}"
  }
};
