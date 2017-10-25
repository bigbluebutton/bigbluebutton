import Users from '/imports/api/users';
import changeRole from '/imports/api/users/server/modifiers/changeRole';

export default function handlePresenterAssigned({ body }, meetingId) {
  const { presenterId, assignedBy } = body;

  changeRole('PRESENTER', true, presenterId, meetingId, assignedBy);

  const selector = {
    meetingId,
    userId: { $ne: presenterId },
    presenter: true,
  };

  const prevPresenter = Users.findOne(selector);
  changeRole('PRESENTER', false, prevPresenter.userId, meetingId, assignedBy);
}
