import Presentations from '/imports/api/presentations';
import { Slides, SlidePositions } from '/imports/api/slides';
import PollService from '/imports/ui/components/poll/service';
import { safeMatch } from '/imports/utils/string-utils';

const POLL_SETTINGS = Meteor.settings.public.poll;
const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
const MAX_CHAR_LIMIT = POLL_SETTINGS.maxTypedAnswerLength;

const getCurrentPresentation = (podId) => Presentations.findOne({
  podId,
  current: true,
});

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
      txtUri: 0,
    },
  });
};

const getSlidesLength = (podId) => getCurrentPresentation(podId)?.pages?.length || 0;

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

// Utility function to escape special characters for regex
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Function to create a regex pattern
const createPattern = (values) => new RegExp(`.*(${escapeRegExp(values[0])}\\/${escapeRegExp(values[1])}|${escapeRegExp(values[1])}\\/${escapeRegExp(values[0])}).*`, 'gmi');

const parseCurrentSlideContent = (yesValue, noValue, abstentionValue, trueValue, falseValue) => {
  const { pollTypes } = PollService;
  const currentSlide = getCurrentSlide('DEFAULT_PRESENTATION_POD');
  const quickPollOptions = [];
  if (!currentSlide) return quickPollOptions;

  let {
    content,
  } = currentSlide;

  let lines = content.split('\n');
  let questions = [];
  let questionLines = [];

  for (let line of lines) {
    let startsWithCapital = /^[A-Z]/.test(line);
    let isEndOfQuestion = /\?$/.test(line);

    if (startsWithCapital) {
      if (questionLines.length > 0) {
        questions.push(questionLines.join(' '));
      }
      questionLines = [];
    }

    questionLines.push(line.trim());

    if (isEndOfQuestion) {
      questions.push(questionLines.join(' '));
      questionLines = [];
    }
  }

  if (questionLines.length > 0) {
    questions.push(questionLines.join(' '));
  }

  const question = questions.filter(q => /^[A-Z].*\?$/.test(q?.trim()));

  if (question?.length > 0) {
    question[0] = question[0]?.replace(/\n/g, ' ');
    const urlRegex = /\bhttps?:\/\/\S+\b/g;
    const hasUrl = safeMatch(urlRegex, question[0], '');
    if (hasUrl.length > 0) question.pop();
  }

  const doubleQuestionRegex = /\?{2}/gm;
  const doubleQuestion = safeMatch(doubleQuestionRegex, content, false);

  const yesNoPatt = createPattern([yesValue, noValue]);
  const hasYN = safeMatch(yesNoPatt, content, false);

  const trueFalsePatt = createPattern([trueValue, falseValue]);
  const hasTF = safeMatch(trueFalsePatt, content, false);

  const pollRegex = /\b[1-9A-Ia-i][.)] .*/g;
  let optionsPoll = safeMatch(pollRegex, content, []);
  const optionsWithLabels = [];

  if (hasYN) {
    optionsPoll = ['yes', 'no'];
  }

  if (optionsPoll) {
    optionsPoll = optionsPoll.map((opt) => {
      const formattedOpt = opt.substring(0, MAX_CHAR_LIMIT);
      optionsWithLabels.push(formattedOpt);
      return `\r${opt[0]}.`;
    });
  }

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
  }) => options.length > 1 && options.length < 10).forEach((p) => {
    const poll = p;
    if (doubleQuestion) poll.multiResp = true;
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

  if (question.length > 0 && optionsPoll.length === 0 && !doubleQuestion && !hasYN && !hasTF) {
    quickPollOptions.push({
      type: 'R-',
      poll: {
        question: question[0],
      },
    });
  }

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

  const pollQuestion = (question?.length > 0 && question[0]?.replace(/ *\([^)]*\) */g, '')) || '';

  return {
    slideId: currentSlide.id,
    quickPollOptions,
    optionsWithLabels,
    pollQuestion,
  };
};

async function replaceImageHrefWithBase64(svgString) {
  const svgDoc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  const xlinkNS = 'http://www.w3.org/1999/xlink';
  await Promise.all(Array.from(svgDoc.querySelectorAll('image')).map(async (img) => {
    const href = img.getAttributeNS(xlinkNS, 'href') || img.getAttribute('href');
    if (href && !href.startsWith('data:')) {
      const base64 = await fetch(href)
        .then((res) => res.blob())
        .then((blob) => new Promise((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result);
          fr.onerror = reject;
          fr.readAsDataURL(blob);
        }));
      img.setAttributeNS(null, 'href', base64);
      img.setAttributeNS(xlinkNS, 'href', base64);
    }
  }));
  return new XMLSerializer().serializeToString(svgDoc);
}

export default {
  getCurrentSlide,
  getSlidePosition,
  isPresentationDownloadable,
  currentSlidHasContent,
  parseCurrentSlideContent,
  getCurrentPresentation,
  getSlidesLength,
  replaceImageHrefWithBase64,
};
