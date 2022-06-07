import { check } from 'meteor/check';
import { getDataFromChangeset } from '/imports/api/captions/server/helpers';
import updatePad from '/imports/api/captions/server/modifiers/updatePad';

export default function handlePadUpdate({ body }) {
  const { pad, revs, changeset } = body;
  const { id } = pad;

  check(id, String);
  check(changeset, String);
  check(revs, Number);

  const data = getDataFromChangeset(changeset);

  if (data !== '') {
    updatePad(id, data, revs);
  }
}
