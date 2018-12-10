import Users from '/imports/api/users';
import changeRole from '/imports/api/users/server/modifiers/changeRole';

export default function handlePresenterAssigned({ body }, meetingId) {
  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_PRESENTER = USER_CONFIG.role_presenter;

  const { presenterId, assignedBy } = body;

  changeRole(ROLE_PRESENTER, true, presenterId, meetingId, assignedBy);

  const selector = {
    meetingId,
    userId: { $ne: presenterId },
    presenter: true,
  };

  const prevPresenter = Users.findOne(selector);

  // no previous presenters
  if (!prevPresenter) {
    return true;
  }

  return changeRole(ROLE_PRESENTER, false, prevPresenter.userId, meetingId, assignedBy);
}
