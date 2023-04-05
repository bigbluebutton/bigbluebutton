import updatePad from '/imports/api/pads/server/modifiers/updatePad';

export default async function padUpdated({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    padId,
    userId,
    rev,
    changeset,
  } = body;

  await updatePad(meetingId, externalId, padId, userId, rev, changeset);
}
