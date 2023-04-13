import updateCaptionsOwner from '/imports/api/captions/server/modifiers/updateCaptionsOwner';

export default async function captionsOwnerUpdated({ header, body }) {
  const { meetingId } = header;
  const {
    locale,
    ownerId,
  } = body;

  await updateCaptionsOwner(meetingId, locale, ownerId);
}
