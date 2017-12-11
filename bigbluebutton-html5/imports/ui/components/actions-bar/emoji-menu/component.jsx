import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { EMOJI_NORMALIZE } from '/imports/utils/statuses';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import styles from './styles';

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
  raiseLabel: {
    id: 'app.actionsBar.emojiMenu.raiseLabel',
    description: 'raise hand emoji label',
  },
  raiseDesc: {
    id: 'app.actionsBar.emojiMenu.raiseDesc',
    description: 'adds context to raise hand option',
  },
  undecidedLabel: {
    id: 'app.actionsBar.emojiMenu.undecidedLabel',
    description: 'undecided emoji label',
  },
  undecidedDesc: {
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
  actions: PropTypes.object.isRequired,
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
        hideLabel
        label={intl.formatMessage(intlMessages.statusTriggerLabel)}
        aria-label={intl.formatMessage(intlMessages.changeStatusLabel)}
        aria-describedby="currentStatus"
        icon={userEmojiStatus in EMOJI_NORMALIZE ?
          EMOJI_NORMALIZE[userEmojiStatus] : 'hand'}
        ghost={false}
        circle
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
        <DropdownListItem
          icon="hand"
          label={intl.formatMessage(intlMessages.raiseLabel)}
          description={intl.formatMessage(intlMessages.raiseDesc)}
          onClick={() => actions.setEmojiHandler('raiseHand')}
          tabIndex={-1}
        />
        <DropdownListItem
          icon="happy"
          label={intl.formatMessage(intlMessages.happyLabel)}
          description={intl.formatMessage(intlMessages.happyDesc)}
          onClick={() => actions.setEmojiHandler('happy')}
          tabIndex={-1}
        />
        <DropdownListItem
          icon="undecided"
          label={intl.formatMessage(intlMessages.undecidedLabel)}
          description={intl.formatMessage(intlMessages.undecidedDesc)}
          onClick={() => actions.setEmojiHandler('neutral')}
          tabIndex={-1}
        />
        <DropdownListItem
          icon="sad"
          label={intl.formatMessage(intlMessages.sadLabel)}
          description={intl.formatMessage(intlMessages.sadDesc)}
          onClick={() => actions.setEmojiHandler('sad')}
          tabIndex={-1}
        />
        <DropdownListItem
          icon="confused"
          label={intl.formatMessage(intlMessages.confusedLabel)}
          description={intl.formatMessage(intlMessages.confusedDesc)}
          onClick={() => actions.setEmojiHandler('confused')}
          tabIndex={-1}
        />
        <DropdownListItem
          icon="time"
          label={intl.formatMessage(intlMessages.awayLabel)}
          description={intl.formatMessage(intlMessages.awayDesc)}
          onClick={() => actions.setEmojiHandler('away')}
          tabIndex={-1}
        />
        <DropdownListItem
          icon="thumbs_up"
          label={intl.formatMessage(intlMessages.thumbsUpLabel)}
          description={intl.formatMessage(intlMessages.thumbsUpDesc)}
          onClick={() => actions.setEmojiHandler('thumbsUp')}
          tabIndex={-1}
        />
        <DropdownListItem
          icon="thumbs_down"
          label={intl.formatMessage(intlMessages.thumbsDownLabel)}
          description={intl.formatMessage(intlMessages.thumbsDownDesc)}
          onClick={() => actions.setEmojiHandler('thumbsDown')}
          tabIndex={-1}
        />
        <DropdownListItem
          icon="applause"
          label={intl.formatMessage(intlMessages.applauseLabel)}
          description={intl.formatMessage(intlMessages.applauseDesc)}
          onClick={() => actions.setEmojiHandler('applause')}
          tabIndex={-1}
        />
        <DropdownListSeparator />
        <DropdownListItem
          icon="clear_status"
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
