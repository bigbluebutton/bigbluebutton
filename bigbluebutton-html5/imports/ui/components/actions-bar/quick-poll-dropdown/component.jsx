import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape } from 'react-intl';
import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { styles } from '../styles';

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
});

const propTypes = {
  intl: intlShape.isRequired,
  parseCurrentSlideContent: PropTypes.func.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
};

const handleClickQuickPoll = (slideId, poll) => {
  const { type } = poll;
  Session.set('openPanel', 'poll');
  Session.set('forcePollOpen', true);

  makeCall('startPoll', type, slideId);
};

const getAvailableQuickPolls = (slideId, parsedSlides) => {
  const pollItemElements = parsedSlides.map((poll) => {
    const { poll: label, type } = poll;
    let itemLabel = label;

    if (type !== 'YN' && type !== 'TF') {
      const { options } = itemLabel;
      itemLabel = options.join('/').replace(/[\n.)]/g, '');
    }

    // removes any whitespace from the label
    itemLabel = itemLabel.replace(/\s+/g, '').toUpperCase();

    const numChars = {
      1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E',
    };
    itemLabel = itemLabel.split('').map((c) => {
      if (numChars[c]) return numChars[c];
      return c;
    }).join('');

    return (
      <DropdownListItem
        label={itemLabel}
        key={_.uniqueId('quick-poll-item')}
        onClick={() => handleClickQuickPoll(slideId, poll)}
      />
    );
  });

  const sizes = [];
  return pollItemElements.filter((el) => {
    const { label } = el.props;
    if (label.length === sizes[sizes.length - 1]) return;
    sizes.push(label.length);
    return el;
  });
};

const QuickPollDropdown = (props) => {
  const { amIPresenter, intl, parseCurrentSlideContent } = props;
  const parsedSlide = parseCurrentSlideContent(
    intl.formatMessage(intlMessages.yesOptionLabel),
    intl.formatMessage(intlMessages.noOptionLabel),
    intl.formatMessage(intlMessages.trueOptionLabel),
    intl.formatMessage(intlMessages.falseOptionLabel),
  );

  const { slideId, quickPollOptions } = parsedSlide;

  return amIPresenter && quickPollOptions && quickPollOptions.length ? (
    <Dropdown>
      <DropdownTrigger tabIndex={0}>
        <Button
          aria-label={intl.formatMessage(intlMessages.quickPollLabel)}
          circle
          className={styles.button}
          color="primary"
          hideLabel
          icon="polling"
          label={intl.formatMessage(intlMessages.quickPollLabel)}
          onClick={() => null}
          size="lg"
        />
      </DropdownTrigger>
      <DropdownContent placement="top left">
        <DropdownList>
          {getAvailableQuickPolls(slideId, quickPollOptions)}
        </DropdownList>
      </DropdownContent>
    </Dropdown>
  ) : null;
};

QuickPollDropdown.propTypes = propTypes;

export default QuickPollDropdown;
