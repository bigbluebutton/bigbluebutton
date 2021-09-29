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

  const defaultPodSelector = {
    meetingId,
    podId: 'DEFAULT_PRESENTATION_POD',
  };

  const currentDefaultPod = PresentationPods.findOne(defaultPodSelector);

  const setPresenterPayload = {
    meetingId,
    requesterUserId: assignedBy,
    presenterId,
  };

  const prevPresenter = Users.findOne(selector);

  if (prevPresenter) {
    changePresenter(false, prevPresenter.userId, meetingId, assignedBy);
  }

  /**
   * In the cases where the first moderator joins the meeting or
   * the current presenter left the meeting, akka-apps doesn't assign the new presenter
   * to the default presentation pod. This step is done manually here.
   */

  if (currentDefaultPod.currentPresenterId !== presenterId) {
    const presenterToBeAssigned = Users.findOne({ userId: presenterId });

    if (!presenterToBeAssigned) setPresenterPayload.presenterId = '';

    setPresenterInPodReqMsg(setPresenterPayload);
  }
}
