import Users from '/imports/api/users';
import PresentationPods from '/imports/api/presentation-pods';
import changePresenter from '/imports/api/users/server/modifiers/changePresenter';
import RedisPubSub from '/imports/startup/server/redis';

function setPresenterInPodReqMsg(credentials) { // TODO-- switch to meetingId, etc
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SetPresenterInPodReqMsg';

  const { meetingId, requesterUserId, presenterId } = credentials;

  const payload = {
    podId: 'DEFAULT_PRESENTATION_POD',
    nextPresenterId: presenterId,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}

export default function handlePresenterAssigned({ body }, meetingId) {
  const { presenterId, assignedBy } = body;

  changePresenter(true, presenterId, meetingId, assignedBy);

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

  changePresenter(false, prevPresenter.userId, meetingId, assignedBy);
}
