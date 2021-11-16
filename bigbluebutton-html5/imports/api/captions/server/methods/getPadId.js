import Captions from '/imports/api/captions';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const hasPadAccess = (meetingId, userId) => {
  const user = Users.findOne(
    { meetingId, userId },
    { fields: { role: 1 }},
  );

  if (!user) return false;

  if (user.role === ROLE_MODERATOR) return true;

  return false;
};

export default function getPadId(locale) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    const caption = Captions.findOne(
      { meetingId, locale },
      {
        fields: {
          padId: 1,
          ownerId: 1,
          readOnlyPadId: 1,
        }
      },
    );

    if (caption) {
      if (hasPadAccess(meetingId, requesterUserId)) {
        if (requesterUserId === caption.ownerId) return caption.padId;

        return caption.readOnlyPadId;
      } else {
        return null;
      }
    }

    return null;
  } catch (err) {
    return null;;
  }
}
