import { check } from 'meteor/check';
import fetchReadOnlyPadId from '/imports/api/captions/server/methods/fetchReadOnlyPadId';

export default function handlePadCreate({ body }) {
  const { pad } = body;
  const { id } = pad;

  check(id, String);

  fetchReadOnlyPadId(id);
}
