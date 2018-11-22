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
  // The below code is responsible for set Meeting presenter to be default pod presenter as well.
  // It's been handled here because right now akka-apps don't handle all cases scenarios.
  if (!prevPresenter) {
    const currentDefaultPodPresenter = PresentationPods.findOne(defaultPodSelector);

    const { currentPresenterId } = currentDefaultPodPresenter;

    const podPresenterCredentials = {
      meetingId,
      requesterUserId: assignedBy,
    };

    if (currentDefaultPodPresenter.currentPresenterId !== '') {
      const oldPresenter = Users.findOne({ userId: currentPresenterId });

      if (oldPresenter.connectionStatus === 'offline') {
        return assignPresenter(podPresenterCredentials, presenterId);
      }
      return true;
    }
    return assignPresenter(podPresenterCredentials, presenterId);
  }

  return changeRole(ROLE_PRESENTER, false, prevPresenter.userId, meetingId, assignedBy);
}
