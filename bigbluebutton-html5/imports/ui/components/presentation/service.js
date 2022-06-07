import PresentationPods from '/imports/api/presentation-pods';
import Presentations from '/imports/api/presentations';
import { Slides, SlidePositions } from '/imports/api/slides';
import Auth from '/imports/ui/services/auth';
import PollService from '/imports/ui/components/poll/service';

const POLL_SETTINGS = Meteor.settings.public.poll;
const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;

const getCurrentPresentation = (podId) => Presentations.findOne({
  podId,
  current: true,
});

const downloadPresentationUri = (podId) => {
  const currentPresentation = getCurrentPresentation(podId);
  if (!currentPresentation) {
    return null;
  }

  const presentationFileName = `${currentPresentation.id}.${currentPresentation.name.split('.').pop()}`;

  const APP = Meteor.settings.public.app;
  const uri = `${APP.bbbWebBase}/presentation/download/`
    + `${currentPresentation.meetingId}/${currentPresentation.id}`
    + `?presFilename=${encodeURIComponent(presentationFileName)}`;

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

const getSlidePosition = (podId, presentationId, slideId) => SlidePositions.findOne({
  podId,
  presentationId,
  id: slideId,
});

const currentSlidHasContent = () => {
  const currentSlide = getCurrentSlide('DEFAULT_PRESENTATION_POD');
  if (!currentSlide) return false;

  const {
    content,
  } = currentSlide;

  return !!content.length;
};

const parseCurrentSlideContent = (yesValue, noValue, abstentionValue, trueValue, falseValue) => {
  const { pollTypes } = PollService;
  const currentSlide = getCurrentSlide('DEFAULT_PRESENTATION_POD');
  const quickPollOptions = [];
  if (!currentSlide) return quickPollOptions;

  let {
    content,
  } = currentSlide;

  const pollRegex = /[1-9A-Ia-i][.)].*/g;
  let optionsPoll = content.match(pollRegex) || [];
  if (optionsPoll) optionsPoll = optionsPoll.map((opt) => `\r${opt[0]}.`);

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
  }) => options.length > 1 && options.length < 10).forEach((poll) => {
    if (poll.options.length <= 5 || MAX_CUSTOM_FIELDS <= 5) {
      const maxAnswer = poll.options.length > MAX_CUSTOM_FIELDS
        ? MAX_CUSTOM_FIELDS
        : poll.options.length;
      quickPollOptions.push({
        type: `${pollTypes.Letter}${maxAnswer}`,
        poll,
      });
    } else {
      quickPollOptions.push({
        type: pollTypes.Custom,
        poll,
      });
    }
  });

  if (quickPollOptions.length > 0) {
    content = content.replace(new RegExp(pollRegex), '');
  }

  const ynPoll = PollService.matchYesNoPoll(yesValue, noValue, content);
  const ynaPoll = PollService.matchYesNoAbstentionPoll(yesValue, noValue, abstentionValue, content);
  const tfPoll = PollService.matchTrueFalsePoll(trueValue, falseValue, content);

  ynPoll.forEach((poll) => quickPollOptions.push({
    type: pollTypes.YesNo,
    poll,
  }));

  ynaPoll.forEach((poll) => quickPollOptions.push({
    type: pollTypes.YesNoAbstention,
    poll,
  }));

  tfPoll.forEach((poll) => quickPollOptions.push({
    type: pollTypes.TrueFalse,
    poll,
  }));

  return {
    slideId: currentSlide.id,
    quickPollOptions,
  };
};

const isPresenter = (podId) => {
  const selector = {
    meetingId: Auth.meetingID,
    podId,
  };
  const pod = PresentationPods.findOne(selector);
  return pod?.currentPresenterId === Auth.userID;
};

export default {
  getCurrentSlide,
  getSlidePosition,
  isPresenter,
  isPresentationDownloadable,
  downloadPresentationUri,
  currentSlidHasContent,
  parseCurrentSlideContent,
  getCurrentPresentation,
};
