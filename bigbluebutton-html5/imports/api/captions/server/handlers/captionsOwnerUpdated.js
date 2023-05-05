import updateCaptionsOwner from '/imports/api/captions/server/modifiers/updateCaptionsOwner';

export default function captionsOwnerUpdated({ header, body }) {
  const { meetingId } = header;
  const {
    locale,
    ownerId,
  } = body;

  updateCaptionsOwner(meetingId, locale, ownerId);
}
