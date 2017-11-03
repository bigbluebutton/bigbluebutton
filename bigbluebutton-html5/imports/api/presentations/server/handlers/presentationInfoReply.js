import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import addPresentation from '../modifiers/addPresentation';
import removePresentation from '../modifiers/removePresentation';

export default function handlePresentationInfoReply({ body }, meetingId) {
  const presentations = body.presentations;

  check(meetingId, String);
  check(presentations, Array);

  const presentationsIds = presentations.map(presentation => presentation.id);

  const presentationsToRemove = Presentations.find({
    meetingId,
    id: { $nin: presentationsIds },
  }).fetch();

  presentationsToRemove.forEach(p => removePresentation(meetingId, p.id));

  const presentationsAdded = [];
  presentations.forEach((presentation) => {
    presentationsAdded.push(addPresentation(meetingId, presentation));
  });

  return presentationsAdded;
}
