import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

const propTypes = {
  // Emoji status of the current user
  userEmojiStatus: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
};

class EmojiMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
     userEmojiStatus,
     actions,
     intl,
   } = this.props;

    return (
      <Dropdown ref="dropdown">
        <DropdownTrigger>
          <Button
            role="button"
            label={intl.formatMessage(intlMessages.statusTriggerLabel)}
            icon="hand"
            ghost={false}
            circle={true}
            hideLabel={false}
            color="primary"
            size="lg"

            // FIXME: Without onClick react proptypes keep warning
            // even after the DropdownTrigger inject an onClick handler
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="top left">
          <DropdownList>
            <DropdownListItem
              icon="raiseHand"
              label={intl.formatMessage(intlMessages.raiseLabel)}
              description={intl.formatMessage(intlMessages.raiseDesc)}
              onClick={() => actions.setEmojiHandler('raiseHand')}
            />
            <DropdownListItem
              icon="happy"
              label={intl.formatMessage(intlMessages.happyLabel)}
              description={intl.formatMessage(intlMessages.happyDesc)}
              onClick={() => actions.setEmojiHandler('happy')}
            />
            <DropdownListItem
              icon="neutral"
              label={intl.formatMessage(intlMessages.undecidedLabel)}
              description={intl.formatMessage(intlMessages.undecidedDesc)}
              onClick={() => actions.setEmojiHandler('neutral')}
            />
            <DropdownListItem
              icon="sad"
              label={intl.formatMessage(intlMessages.sadLabel)}
              description={intl.formatMessage(intlMessages.sadDesc)}
              onClick={() => actions.setEmojiHandler('sad')}
            />
            <DropdownListItem
              icon="confused"
              label={intl.formatMessage(intlMessages.confusedLabel)}
              description={intl.formatMessage(intlMessages.confusedDesc)}
              onClick={() => actions.setEmojiHandler('confused')}
            />
            <DropdownListItem
              icon="away"
              label={intl.formatMessage(intlMessages.awayLabel)}
              description={intl.formatMessage(intlMessages.awayDesc)}
              onClick={() => actions.setEmojiHandler('away')}
            />
            <DropdownListItem
              icon="thumbsUp"
              label={intl.formatMessage(intlMessages.thumbsupLabel)}
              description={intl.formatMessage(intlMessages.thumbsupDesc)}
              onClick={() => actions.setEmojiHandler('thumbsUp')}
            />
            <DropdownListItem
              icon="thumbsDown"
              label={intl.formatMessage(intlMessages.thumbsdownLabel)}
              description={intl.formatMessage(intlMessages.thumbsdownDesc)}
              onClick={() => actions.setEmojiHandler('thumbsDown')}
            />
            <DropdownListItem
              icon="applause"
              label={intl.formatMessage(intlMessages.applauseLabel)}
              description={intl.formatMessage(intlMessages.applauseDesc)}
              onClick={() => actions.setEmojiHandler('applause')}
            />
            <DropdownListSeparator/>
            <DropdownListItem
              icon="clear-status"
              label={intl.formatMessage(intlMessages.clearLabel)}
              description={intl.formatMessage(intlMessages.clearDesc)}
              onClick={() => actions.setEmojiHandler('none')}
            />
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

const intlMessages = defineMessages({
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    defaultMessage: 'Status',
  },

  // For away status
  awayLabel: {
    id: 'app.actionsBar.emojiMenu.awayLabel',
    defaultMessage: 'Away',
  },
  awayDesc: {
    id: 'app.actionsBar.emojiMenu.awayDesc',
    defaultMessage: 'Change your status to away',
  },

  // For raise hand status
  raiseLabel: {
    id: 'app.actionsBar.emojiMenu.raiseLabel',
    defaultMessage: 'Raise',
  },
  raiseDesc: {
    id: 'app.actionsBar.emojiMenu.raiseDesc',
    defaultMessage: 'Raise your hand to ask a question',
  },

  // For undecided status
  undecidedLabel: {
    id: 'app.actionsBar.emojiMenu.undecidedLabel',
    defaultMessage: 'Undecided',
  },
  undecidedDesc: {
    id: 'app.actionsBar.emojiMenu.undecidedDesc',
    defaultMessage: 'Change your status to undecided',
  },

  // For confused status
  confusedLabel: {
    id: 'app.actionsBar.emojiMenu.confusedLabel',
    defaultMessage: 'Confused',
  },
  confusedDesc: {
    id: 'app.actionsBar.emojiMenu.confusedDesc',
    defaultMessage: 'Change your status to confused',
  },

  // For sad status
  sadLabel: {
    id: 'app.actionsBar.emojiMenu.sadLabel',
    defaultMessage: 'Sad',
  },
  sadDesc: {
    id: 'app.actionsBar.emojiMenu.sadDesc',
    defaultMessage: 'Change your status to sad',
  },

  // For happy status
  happyLabel: {
    id: 'app.actionsBar.emojiMenu.happyLabel',
    defaultMessage: 'Happy',
  },
  happyDesc: {
    id: 'app.actionsBar.emojiMenu.happyDesc',
    defaultMessage: 'Change your status to happy',
  },

  // For confused status
  clearLabel: {
    id: 'app.actionsBar.emojiMenu.clearLabel',
    defaultMessage: 'Clear',
  },
  clearDesc: {
    id: 'app.actionsBar.emojiMenu.clearDesc',
    defaultMessage: 'Clear your status',
  },

  // For applause status
  applauseLabel: {
    id: 'app.actionsBar.emojiMenu.applauseLabel',
    defaultMessage: 'Applause',
  },
  applauseDesc: {
    id: 'app.actionsBar.emojiMenu.applauseDesc',
    defaultMessage: 'Change your status to applause',
  },

  // For thumbs up status
  thumbsupLabel: {
    id: 'app.actionsBar.emojiMenu.thumbsupLabel',
    defaultMessage: 'Thumbs up',
  },
  thumbsupDesc: {
    id: 'app.actionsBar.emojiMenu.thumbsupDesc',
    defaultMessage: 'Change your status to thumbs up',
  },

  // For thumbs-down status
  thumbsdownLabel: {
    id: 'app.actionsBar.emojiMenu.thumbsdownLabel',
    defaultMessage: 'Thumbs down',
  },
  thumbsdownDesc: {
    id: 'app.actionsBar.emojiMenu.thumbsdownDesc',
    defaultMessage: 'Change your status to thumbs down',
  },
});

EmojiMenu.propTypes = propTypes;
export default injectIntl(EmojiMenu);
