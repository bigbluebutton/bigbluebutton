import Presentations from '/imports/api/presentations';

export function addPresentationToCollection(meetingId, presentationObject) {
  //check if the presentation is already in the collection
  let presentationObj = Presentations.findOne({
    meetingId: meetingId,
    'presentation.id': presentationObject.id,
  });
  if (presentationObj == null) {
    let entry = {
      meetingId: meetingId,
      presentation: {
        id: presentationObject.id,
        name: presentationObject.name,
        current: presentationObject.current,
      },
    };
    return Presentations.insert(entry);

    //logger.info "presentation added id =[#{id}]:#{presentationObject.id} in #{meetingId}.
    // Presentations.size is now #{Presentations.find({meetingId: meetingId}).count()}"
  }
};
