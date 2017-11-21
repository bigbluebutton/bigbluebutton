import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { EMOJI_STATUSES, CLEAR_STATUS } from '/imports/utils/statuses';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import styles from '../styles';

const intlMessages = defineMessages({
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'Emoji status button label',
  },
  awayLabel: {
    id: 'app.actionsBar.emojiMenu.awayLabel',
    description: 'Away emoji label',
  },
  awayDesc: {
    id: 'app.actionsBar.emojiMenu.awayDesc',
    description: 'adds context to away option',
  },
  raiseHandLabel: {
    id: 'app.actionsBar.emojiMenu.raiseLabel',
    description: 'raise hand emoji label',
  },
  raiseHandDesc: {
    id: 'app.actionsBar.emojiMenu.raiseDesc',
    description: 'adds context to raise hand option',
  },
  neutralLabel: {
    id: 'app.actionsBar.emojiMenu.undecidedLabel',
    description: 'undecided emoji label',
  },
  neutralDesc: {
    id: 'app.actionsBar.emojiMenu.undecidedDesc',
    description: 'adds context to undecided option',
  },
  confusedLabel: {
    id: 'app.actionsBar.emojiMenu.confusedLabel',
    description: 'confused emoji label',
  },
  confusedDesc: {
    id: 'app.actionsBar.emojiMenu.confusedDesc',
    description: 'adds context to confused option',
  },
  sadLabel: {
    id: 'app.actionsBar.emojiMenu.sadLabel',
    description: 'sad emoji label',
  },
  sadDesc: {
    id: 'app.actionsBar.emojiMenu.sadDesc',
    description: 'adds context to sad option',
  },
  happyLabel: {
    id: 'app.actionsBar.emojiMenu.happyLabel',
    description: 'happy emoji label',
  },
  happyDesc: {
    id: 'app.actionsBar.emojiMenu.happyDesc',
    description: 'adds context to happy option',
  },
  clearLabel: {
    id: 'app.actionsBar.emojiMenu.clearLabel',
    description: 'confused emoji label',
  },
  clearDesc: {
    id: 'app.actionsBar.emojiMenu.clearDesc',
    description: 'adds context to clear status option',
  },
  applauseLabel: {
    id: 'app.actionsBar.emojiMenu.applauseLabel',
    description: 'applause emoji label',
  },
  applauseDesc: {
    id: 'app.actionsBar.emojiMenu.applauseDesc',
    description: 'adds context to applause option',
  },
  thumbsUpLabel: {
    id: 'app.actionsBar.emojiMenu.thumbsUpLabel',
    description: 'thumbs up emoji label',
  },
  thumbsUpDesc: {
    id: 'app.actionsBar.emojiMenu.thumbsUpDesc',
    description: 'adds context to thumbs up option',
  },
  thumbsDownLabel: {
    id: 'app.actionsBar.emojiMenu.thumbsDownLabel',
    description: 'thumbs down emoji label',
  },
  thumbsDownDesc: {
    id: 'app.actionsBar.emojiMenu.thumbsDownDesc',
    description: 'adds context to thumbs down option',
  },
  changeStatusLabel: {
    id: 'app.actionsBar.changeStatusLabel',
    description: 'Aria-label for emoji status button',
  },
  currentStatusDesc: {
    id: 'app.actionsBar.currentStatusDesc',
    description: 'Aria description for status button',
  },
});

const propTypes = {
  // Emoji status of the current user
  intl: intlShape.isRequired,
  userEmojiStatus: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    setEmojiHandler: PropTypes.func.isRequired,
  }).isRequired,
};

const EmojiMenu = ({
  userEmojiStatus,
  actions,
  intl,
}) => (
  <Dropdown autoFocus>
    <DropdownTrigger tabIndex={0}>
      <Button
        className={styles.button}
        role="button"
        label={intl.formatMessage(intlMessages.statusTriggerLabel)}
        aria-label={intl.formatMessage(intlMessages.changeStatusLabel)}
        aria-describedby="currentStatus"
        icon={EMOJI_STATUSES[userEmojiStatus] || 'hand'}
        ghost={false}
        circle
        hideLabel={false}
        color="primary"
        size="lg"

        // FIXME: Without onClick react proptypes keep warning
        // even after the DropdownTrigger inject an onClick handler
        onClick={() => null}
      >
        <div id="currentStatus" hidden>
          { intl.formatMessage(intlMessages.currentStatusDesc, { 0: userEmojiStatus }) }
        </div>
      </Button>
    </DropdownTrigger>
    <DropdownContent placement="top left">
      <DropdownList>
        {
          Object.keys(EMOJI_STATUSES).map(status => (
            <DropdownListItem
              className={userEmojiStatus === status ? styles.emojiSelected : null}
              icon={EMOJI_STATUSES[status]}
              label={intl.formatMessage(intlMessages[`${status}Label`])}
              description={intl.formatMessage(intlMessages[`${status}Desc`])}
              onClick={() => actions.setEmojiHandler(status)}
              tabIndex={-1}
            />
          ))
        }
        <DropdownListSeparator />
        <DropdownListItem
          icon={CLEAR_STATUS.none}
          label={intl.formatMessage(intlMessages.clearLabel)}
          description={intl.formatMessage(intlMessages.clearDesc)}
          onClick={() => actions.setEmojiHandler('none')}
          tabIndex={-1}
        />
      </DropdownList>
    </DropdownContent>
  </Dropdown>
);

EmojiMenu.propTypes = propTypes;
export default injectIntl(EmojiMenu);
