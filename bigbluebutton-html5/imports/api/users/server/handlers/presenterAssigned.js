import Users from '/imports/api/users';
import PresentationPods from '/imports/api/presentation-pods';
import changeRole from '/imports/api/users/server/modifiers/changeRole';
import setPresenterInPodReqMsg from '/imports/api/presentation-pods/server/methods/setPresenterInPodReqMsg';

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
  // The below code is responsible for set Meeting presenter to be default pod presenter as well.
  // It's been handled here because right now akka-apps don't handle all cases scenarios.
  if (!prevPresenter) {
    const setPresenterPayload = {
      meetingId,
      requesterUserId: assignedBy,
      presenterId,
    };

    const defaultPodSelector = {
      meetingId,
      podId: 'DEFAULT_PRESENTATION_POD',
    };
    const currentDefaultPodPresenter = PresentationPods.findOne(defaultPodSelector);
    const { currentPresenterId } = currentDefaultPodPresenter;

    if (currentPresenterId === '') {
      return setPresenterInPodReqMsg(setPresenterPayload);
    }

    const oldPresenter = Users.findOne({ meetingId, userId: currentPresenterId, connectionStatus: 'offline' });

    if (oldPresenter) {
      return setPresenterInPodReqMsg(setPresenterPayload);
    }

    return true;
  }

  return changeRole(ROLE_PRESENTER, false, prevPresenter.userId, meetingId, assignedBy);
}
