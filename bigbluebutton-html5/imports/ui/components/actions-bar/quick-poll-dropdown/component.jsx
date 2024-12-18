import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import Dropdown from '/imports/ui/components/dropdown/component';
import Styled from './styles';
import { PANELS, ACTIONS } from '../../layout/enums';
import { uniqueId, safeMatch } from '/imports/utils/string-utils';
import PollService from '/imports/ui/components/poll/service';
import Session from '/imports/ui/services/storage/in-memory';

const intlMessages = defineMessages({
  quickPollLabel: {
    id: 'app.poll.quickPollTitle',
    description: 'Quick poll button title',
  },
  trueOptionLabel: {
    id: 'app.poll.t',
    description: 'Poll true option value',
  },
  falseOptionLabel: {
    id: 'app.poll.f',
    description: 'Poll false option value',
  },
  yesOptionLabel: {
    id: 'app.poll.y',
    description: 'Poll yes option value',
  },
  noOptionLabel: {
    id: 'app.poll.n',
    description: 'Poll no option value',
  },
  abstentionOptionLabel: {
    id: 'app.poll.abstention',
    description: 'Poll Abstention option value',
  },
  typedRespLabel: {
    id: 'app.poll.userResponse.label',
    description: 'quick poll typed response label',
  },
});

const propTypes = {
  amIPresenter: PropTypes.bool.isRequired,
};

const QuickPollDropdown = (props) => {
  const {
    amIPresenter,
    startPoll,
    stopPoll,
    currentSlide,
    activePoll,
    className,
    layoutContextDispatch,
    pollTypes,
  } = props;

  const intl = useIntl();

  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
  const MAX_CHAR_LIMIT = POLL_SETTINGS.maxTypedAnswerLength;
  const CANCELED_POLL_DELAY = 250;

  // Utility function to escape special characters for regex
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Function to create a regex pattern
  const createPattern = (values) => new RegExp(`.*(${escapeRegExp(values[0])}\\/${escapeRegExp(values[1])}|${escapeRegExp(values[1])}\\/${escapeRegExp(values[0])}).*`, 'gmi');

  const yesValue = intl.formatMessage(intlMessages.yesOptionLabel);
  const noValue = intl.formatMessage(intlMessages.noOptionLabel);
  const abstentionValue = intl.formatMessage(intlMessages.abstentionOptionLabel);
  const trueValue = intl.formatMessage(intlMessages.trueOptionLabel);
  const falseValue = intl.formatMessage(intlMessages.falseOptionLabel);

  const quickPollOptions = [];

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

  const slideId = currentSlide.id;

  const handleClickQuickPoll = (lCDispatch) => {
    lCDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    lCDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.POLL,
    });
    Session.setItem('forcePollOpen', true);
    Session.setItem('pollInitiated', true);
  };

  const getAvailableQuickPolls = (
    slideId, parsedSlides, funcStartPoll, _pollTypes, _layoutContextDispatch,
  ) => {
    const pollItemElements = parsedSlides.map((poll) => {
      const { poll: label } = poll;
      const { type, poll: pollData } = poll;
      let itemLabel = label;
      const letterAnswers = [];

      if (type === 'R-') {
        return (
          <Dropdown.DropdownListItem
            label={intl.formatMessage(intlMessages.typedRespLabel)}
            key={uniqueId('quick-poll-item')}
            onClick={() => {
              if (activePoll) {
                stopPoll();
              }
              setTimeout(() => {
                handleClickQuickPoll(_layoutContextDispatch);
                funcStartPoll(type, slideId, letterAnswers, pollData?.question);
              }, CANCELED_POLL_DELAY);
            }}
            question={pollData?.question}
          />
        );
      }

      if (type !== _pollTypes.YesNo
          && type !== _pollTypes.YesNoAbstention
          && type !== _pollTypes.TrueFalse) {
        const { options } = itemLabel;
        itemLabel = options.join('/').replace(/[\n.)]/g, '');
        if (type === _pollTypes.Custom) {
          for (let i = 0; i < options.length; i += 1) {
            const letterOption = options[i]?.replace(/[\r.)]/g, '').toUpperCase();
            if (letterAnswers.length < MAX_CUSTOM_FIELDS) {
              letterAnswers.push(letterOption);
            } else {
              break;
            }
          }
        }
      }

      // removes any whitespace from the label
      itemLabel = itemLabel?.replace(/\s+/g, '').toUpperCase();

      const numChars = {
        1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 9: 'I',
      };
      itemLabel = itemLabel.split('').map((c) => {
        if (numChars[c]) return numChars[c];
        return c;
      }).join('');

      return (
        <Dropdown.DropdownListItem
          label={itemLabel}
          key={uniqueId('quick-poll-item')}
          onClick={() => {
            if (activePoll) {
              stopPoll();
            }
            setTimeout(() => {
              handleClickQuickPoll(_layoutContextDispatch);
              funcStartPoll(type, slideId, letterAnswers, pollQuestion, pollData?.multiResp);
            }, CANCELED_POLL_DELAY);
          }}
          answers={letterAnswers}
          multiResp={pollData?.multiResp}
        />
      );
    });

    const sizes = [];
    return pollItemElements.filter((el) => {
      const { label } = el.props;
      if (label.length === sizes[sizes.length - 1]) return false;
      sizes.push(label.length);
      return el;
    });
  };

  const quickPolls = getAvailableQuickPolls(
    slideId, quickPollOptions, startPoll, pollTypes, layoutContextDispatch,
  );

  if (quickPollOptions.length === 0) return null;

  let answers = null;
  let quickPollLabel = '';
  let multiResponse = false;

  if (quickPolls.length > 0) {
    const { props: pollProps } = quickPolls[0];
    quickPollLabel = pollProps?.label;
    answers = pollProps?.answers;
    multiResponse = pollProps?.multiResp;
  }

  let singlePollType = null;
  if (quickPolls.length === 1 && quickPollOptions.length) {
    const { type } = quickPollOptions[0];
    singlePollType = type;
  }

  let btn = (
    <Styled.QuickPollButton
      aria-label={intl.formatMessage(intlMessages.quickPollLabel)}
      label={quickPollLabel}
      tooltipLabel={intl.formatMessage(intlMessages.quickPollLabel)}
      onClick={() => {
        if (activePoll) {
          stopPoll();
        }

        setTimeout(() => {
          handleClickQuickPoll(layoutContextDispatch);
          if (singlePollType === 'R-' || singlePollType === 'TF' || singlePollType === 'YN') {
            startPoll(singlePollType, currentSlide.id, answers, pollQuestion, multiResponse);
          } else {
            startPoll(
              pollTypes.Custom,
              currentSlide.id,
              optionsWithLabels,
              pollQuestion,
              multiResponse,
            );
          }
        }, CANCELED_POLL_DELAY);
      }}
      size="lg"
      data-test="quickPollBtn"
      color="primary"
    />
  );

  const usePollDropdown = quickPollOptions && quickPollOptions.length && quickPolls.length > 1;
  let dropdown = null;

  if (usePollDropdown) {
    btn = (
      <Styled.QuickPollButton
        aria-label={intl.formatMessage(intlMessages.quickPollLabel)}
        label={quickPollLabel}
        tooltipLabel={intl.formatMessage(intlMessages.quickPollLabel)}
        onClick={() => null}
        size="lg"
        data-test="yesNoQuickPoll"
      />
    );

    dropdown = (
      <Dropdown className={className}>
        <Dropdown.DropdownTrigger tabIndex={0}>
          {btn}
        </Dropdown.DropdownTrigger>
        <Dropdown.DropdownContent>
          <Dropdown.DropdownList>
            {quickPolls}
          </Dropdown.DropdownList>
        </Dropdown.DropdownContent>
      </Dropdown>
    );
  }

  return amIPresenter && usePollDropdown ? (
    dropdown
  ) : (
    btn
  );
};

QuickPollDropdown.propTypes = propTypes;

export default QuickPollDropdown;
