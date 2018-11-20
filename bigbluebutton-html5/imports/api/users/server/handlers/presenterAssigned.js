import Users from '/imports/api/users';
import PresentationPods from '/imports/api/presentation-pods';
import changeRole from '/imports/api/users/server/modifiers/changeRole';
import assignPresenter from '../methods/assignPresenter';

export default function handlePresenterAssigned(credentials, meetingId) {
  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_PRESENTER = USER_CONFIG.role_presenter;

  const { body } = credentials;
  const { presenterId, assignedBy } = body;

  changeRole(ROLE_PRESENTER, true, presenterId, meetingId, assignedBy);

  const selector = {
    meetingId,
    userId: { $ne: presenterId },
    presenter: true,
  };

  const defaultPodSelector = {
    podId: 'DEFAULT_PRESENTATION_POD',
  };

  const prevPresenter = Users.findOne(selector);

  // no previous presenters
  if (!prevPresenter) {
    const currentDefaultPodPresenter = PresentationPods.findOne(defaultPodSelector);

    const { currentPresenterId } = currentDefaultPodPresenter;

    const fakeCredentials = {
      meetingId,
      requesterUserId: assignedBy,
    };

    if (currentDefaultPodPresenter.currentPresenterId !== '') {
      const oldPresenter = Users.findOne({ userId: currentPresenterId });

      if (oldPresenter.connectionStatus === 'offline') {
        return assignPresenter(fakeCredentials, presenterId);
      }
      return true;
    }
    return assignPresenter(fakeCredentials, presenterId);
  }

  return changeRole(ROLE_PRESENTER, false, prevPresenter.userId, meetingId, assignedBy);
}
