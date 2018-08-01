import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';
import PresentationPods from '/imports/api/presentation-pods';
import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

const getCurrentPresentation = podId => Presentations.findOne({
  podId,
  current: true,
});

const getCurrentSlide = (podId) => {
  const currentPresentation = getCurrentPresentation(podId);

  if (!currentPresentation) {
    return null;
  }

  return Slides.findOne(
    {
      podId,
      presentationId: currentPresentation.id,
      current: true,
    },
    {
      fields: {
        meetingId: 0,
        thumbUri: 0,
        swfUri: 0,
        txtUri: 0,
        svgUri: 0,
      },
    },
  );
};

const isPresenter = (podId) => {
  // a main presenter in the meeting always owns a default pod
  if (podId === 'DEFAULT_PRESENTATION_POD') {
    const currentUser = Users.findOne({ userId: Auth.userID });
    return currentUser ? currentUser.presenter : false;
  }

  // if a pod is not default, then we check whether this user owns a current pod
  const selector = {
    meetingId: Auth.meetingID,
    podId,
  };
  const pod = PresentationPods.findOne(selector);
  return pod.currentPresenterId === Auth.userID;
};

const getMultiUserStatus = (whiteboardId) => {
  const data = WhiteboardMultiUser.findOne({ meetingId: Auth.meetingID, whiteboardId });
  return data ? data.multiUser : false;
};

export default {
  getCurrentPresentation,
  getCurrentSlide,
  isPresenter,
  getMultiUserStatus,
};
