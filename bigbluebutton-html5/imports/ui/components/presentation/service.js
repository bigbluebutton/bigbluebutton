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

const downloadPresentationUri = (podId) => {
  const currentPresentation = getCurrentPresentation(podId);
  if (!currentPresentation) {
    return null;
  }

  const uri = `https://${window.document.location.hostname}/bigbluebutton/presentation/download/`
    + `${currentPresentation.meetingId}/${currentPresentation.id}`
    + `?presFilename=${encodeURIComponent(currentPresentation.name)}`;

  return uri;
};

const isPresentationDownloadable = (podId) => {
  const currentPresentation = getCurrentPresentation(podId);
  if (!currentPresentation) {
    return null;
  }

  return currentPresentation.downloadable;
};

const getCurrentSlide = (podId) => {
  const currentPresentation = getCurrentPresentation(podId);

  if (!currentPresentation) {
    return null;
  }

  return Slides.findOne({
    podId,
    presentationId: currentPresentation.id,
    current: true,
  }, {
    fields: {
      meetingId: 0,
      thumbUri: 0,
      swfUri: 0,
      txtUri: 0,
    },
  });
};

const currentSlidHasContent = () => {
  const currentSlide = getCurrentSlide('DEFAULT_PRESENTATION_POD');
  if (!currentSlide) return false;

  const {
    content,
  } = currentSlide;

  return !!content.length;
};

const parseCurrentSlideContent = (yesValue, noValue, trueValue, falseValue) => {
  const currentSlide = getCurrentSlide('DEFAULT_PRESENTATION_POD');
  const quickPollOptions = [];
  if (!currentSlide) return quickPollOptions;

  const {
    content,
  } = currentSlide;

  const pollRegex = /\n[^\s][.)]/g;
  const optionsPoll = content.match(pollRegex) || [];

  const ynPollString = `(${yesValue}\\s*\\/\\s*${noValue})|(${noValue}\\s*\\/\\s*${yesValue})`;
  const ynOptionsRegex = new RegExp(ynPollString, 'gi');
  const ynPoll = content.match(ynOptionsRegex) || [];

  const tfPollString = `(${trueValue}\\s*\\/\\s*${falseValue})|(${falseValue}\\s*\\/\\s*${trueValue})`;
  const tgOptionsRegex = new RegExp(tfPollString, 'gi');
  const tfPoll = content.match(tgOptionsRegex) || [];

  optionsPoll.reduce((acc, currentValue) => {
    const lastElement = acc[acc.length - 1];

    if (!lastElement) {
      acc.push({
        options: [currentValue],
      });
      return acc;
    }

    const {
      options,
    } = lastElement;

    const lastOption = options[options.length - 1];

    const isLastOptionInteger = !!parseInt(lastOption.charAt(1), 10);
    const isCurrentValueInteger = !!parseInt(currentValue.charAt(1), 10);

    if (isLastOptionInteger === isCurrentValueInteger) {
      if (currentValue.toLowerCase().charCodeAt(1) > lastOption.toLowerCase().charCodeAt(1)) {
        options.push(currentValue);
      } else {
        acc.push({
          options: [currentValue],
        });
      }
    } else {
      acc.push({
        options: [currentValue],
      });
    }
    return acc;
  }, []).filter(({
    options,
  }) => options.length > 1 && options.length < 7).forEach(poll => quickPollOptions.push({
    type: `A-${poll.options.length}`,
    poll,
  }));

  ynPoll.forEach(poll => quickPollOptions.push({
    type: 'YN',
    poll,
  }));

  tfPoll.forEach(poll => quickPollOptions.push({
    type: 'TF',
    poll,
  }));

  return {
    slideId: currentSlide.id,
    quickPollOptions,
  };
};

const isPresenter = (podId) => {
  // a main presenter in the meeting always owns a default pod
  if (podId === 'DEFAULT_PRESENTATION_POD') {
    const currentUser = Users.findOne({
      userId: Auth.userID,
    });
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
  const data = WhiteboardMultiUser.findOne({
    meetingId: Auth.meetingID,
    whiteboardId,
  });
  return data ? data.multiUser : false;
};

export default {
  getCurrentSlide,
  isPresenter,
  isPresentationDownloadable,
  downloadPresentationUri,
  getMultiUserStatus,
  currentSlidHasContent,
  parseCurrentSlideContent,
};
