import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import _ from 'lodash';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import { styles } from '../styles';
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
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  parseCurrentSlideContent: PropTypes.func.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
};

const handleClickQuickPoll = (layoutContextDispatch) => {
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
    value: true,
  });
  layoutContextDispatch({
    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
    value: PANELS.POLL,
  });
  Session.set('forcePollOpen', true);
  Session.set('pollInitiated', true);
};

const getAvailableQuickPolls = (
  slideId, parsedSlides, startPoll, pollTypes, layoutContextDispatch,
) => {
  const pollItemElements = parsedSlides.map((poll) => {
    const { poll: label } = poll;
    const { type } = poll;
    let itemLabel = label;
    const letterAnswers = [];

    if (type !== pollTypes.YesNo
      && type !== pollTypes.YesNoAbstention
      && type !== pollTypes.TrueFalse) {
      const { options } = itemLabel;
      itemLabel = options.join('/').replace(/[\n.)]/g, '');
      if (type === pollTypes.Custom) {
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
          handleClickQuickPoll(layoutContextDispatch);
          startPoll(type, slideId, letterAnswers);
        }}
        answers={letterAnswers}
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

class QuickPollDropdown extends Component {
  render() {
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
    } = this.props;

    const parsedSlide = parseCurrentSlideContent(
      intl.formatMessage(intlMessages.yesOptionLabel),
      intl.formatMessage(intlMessages.noOptionLabel),
      intl.formatMessage(intlMessages.abstentionOptionLabel),
      intl.formatMessage(intlMessages.trueOptionLabel),
      intl.formatMessage(intlMessages.falseOptionLabel),
    );

    const { slideId, quickPollOptions } = parsedSlide;
    const quickPolls = getAvailableQuickPolls(
      slideId, quickPollOptions, startPoll, pollTypes, layoutContextDispatch,
    );

    if (quickPollOptions.length === 0) return null;

    let answers = null;
    let quickPollLabel = '';
    if (quickPolls.length > 0) {
      const { props: pollProps } = quickPolls[0];
      quickPollLabel = pollProps.label;
      answers = pollProps.answers;
    }

    let singlePollType = null;
    if (quickPolls.length === 1 && quickPollOptions.length) {
      const { type } = quickPollOptions[0];
      singlePollType = type;
    }

    let btn = (
      <Button
        aria-label={intl.formatMessage(intlMessages.quickPollLabel)}
        className={styles.quickPollBtn}
        label={quickPollLabel}
        tooltipLabel={intl.formatMessage(intlMessages.quickPollLabel)}
        onClick={() => {
          handleClickQuickPoll(layoutContextDispatch);
          startPoll(singlePollType, currentSlide.id, answers);
        }}
        size="lg"
        disabled={!!activePoll}
      />
    );

    const usePollDropdown = quickPollOptions && quickPollOptions.length && quickPolls.length > 1;
    let dropdown = null;

    if (usePollDropdown) {
      btn = (
        <Button
          aria-label={intl.formatMessage(intlMessages.quickPollLabel)}
          className={styles.quickPollBtn}
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
          <Dropdown.DropdownContent placement="top left">
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
  }
}

QuickPollDropdown.propTypes = propTypes;

export default QuickPollDropdown;
