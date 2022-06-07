import { check } from 'meteor/check';
import updateNote from '/imports/api/note/server/modifiers/updateNote';

export default function handlePadUpdate({ body }) {
  const { pad, revs } = body;
  const { id } = pad;

  check(id, String);
  check(revs, Number);

  updateNote(id, revs);
}
