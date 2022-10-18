import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import _ from 'lodash';
import Dropdown from '/imports/ui/components/dropdown/component';
import Styled from './styles';
import { PANELS, ACTIONS } from '../../layout/enums';

const POLL_SETTINGS = Meteor.settings.public.poll;
const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;

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
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  parseCurrentSlideContent: PropTypes.func.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
};

const QuickPollDropdown = (props) => {
  const {
    amIPresenter,
    intl,
    parseCurrentSlideContent,
    startPoll,
    currentSlide,
    activePoll,
    className,
    layoutContextDispatch,
    pollTypes,
  } = props;

  const parsedSlide = parseCurrentSlideContent(
    intl.formatMessage(intlMessages.yesOptionLabel),
    intl.formatMessage(intlMessages.noOptionLabel),
    intl.formatMessage(intlMessages.abstentionOptionLabel),
    intl.formatMessage(intlMessages.trueOptionLabel),
    intl.formatMessage(intlMessages.falseOptionLabel),
  );

  const {
    slideId, quickPollOptions, optionsWithLabels, pollQuestion,
  } = parsedSlide;

  const handleClickQuickPoll = (lCDispatch) => {
    lCDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    lCDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.POLL,
    });
    Session.set('forcePollOpen', true);
    Session.set('pollInitiated', true);
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
            key={_.uniqueId('quick-poll-item')}
            onClick={() => {
              handleClickQuickPoll(_layoutContextDispatch);
              funcStartPoll(type, slideId, letterAnswers, pollData?.question);
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
        1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E',
      };
      itemLabel = itemLabel.split('').map((c) => {
        if (numChars[c]) return numChars[c];
        return c;
      }).join('');

      return (
        <Dropdown.DropdownListItem
          label={itemLabel}
          key={_.uniqueId('quick-poll-item')}
          onClick={() => {
            handleClickQuickPoll(_layoutContextDispatch);
            funcStartPoll(type, slideId, letterAnswers, pollQuestion, pollData?.multiResp);
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
  let question = '';
  let quickPollLabel = '';
  let multiResponse = false;

  if (quickPolls.length > 0) {
    const { props: pollProps } = quickPolls[0];
    quickPollLabel = pollProps?.label;
    answers = pollProps?.answers;
    question = pollProps?.question;
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
        handleClickQuickPoll(layoutContextDispatch);
        if (singlePollType === 'R-' || singlePollType === 'TF') {
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
      }}
      size="lg"
      disabled={!!activePoll}
      data-test="quickPollBtn"
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
        disabled={!!activePoll}
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
