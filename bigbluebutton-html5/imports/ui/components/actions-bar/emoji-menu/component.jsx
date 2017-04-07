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
            aria-label={intl.formatMessage(intlMessages.changeStatusLabel)}
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
              icon="hand"
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
              icon="undecided"
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
              icon="time"
              label={intl.formatMessage(intlMessages.awayLabel)}
              description={intl.formatMessage(intlMessages.awayDesc)}
              onClick={() => actions.setEmojiHandler('away')}
            />
            <DropdownListItem
              icon="thumbs_up"
              label={intl.formatMessage(intlMessages.thumbsupLabel)}
              description={intl.formatMessage(intlMessages.thumbsupDesc)}
              onClick={() => actions.setEmojiHandler('thumbsUp')}
            />
            <DropdownListItem
              icon="thumbs_down"
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
            <DropdownListSeparator />
            <DropdownListItem
              icon="clear_status"
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
  },

  // For away status
  awayLabel: {
    id: 'app.actionsBar.emojiMenu.awayLabel',
  },
  awayDesc: {
    id: 'app.actionsBar.emojiMenu.awayDesc',
  },

  // For raise hand status
  raiseLabel: {
    id: 'app.actionsBar.emojiMenu.raiseLabel',
  },
  raiseDesc: {
    id: 'app.actionsBar.emojiMenu.raiseDesc',
  },

  // For undecided status
  undecidedLabel: {
    id: 'app.actionsBar.emojiMenu.undecidedLabel',
  },
  undecidedDesc: {
    id: 'app.actionsBar.emojiMenu.undecidedDesc',
  },

  // For confused status
  confusedLabel: {
    id: 'app.actionsBar.emojiMenu.confusedLabel',
  },
  confusedDesc: {
    id: 'app.actionsBar.emojiMenu.confusedDesc',
  },

  // For sad status
  sadLabel: {
    id: 'app.actionsBar.emojiMenu.sadLabel',
  },
  sadDesc: {
    id: 'app.actionsBar.emojiMenu.sadDesc',
  },

  // For happy status
  happyLabel: {
    id: 'app.actionsBar.emojiMenu.happyLabel',
  },
  happyDesc: {
    id: 'app.actionsBar.emojiMenu.happyDesc',
  },

  // For confused status
  clearLabel: {
    id: 'app.actionsBar.emojiMenu.clearLabel',
  },
  clearDesc: {
    id: 'app.actionsBar.emojiMenu.clearDesc',
  },

  // For applause status
  applauseLabel: {
    id: 'app.actionsBar.emojiMenu.applauseLabel',
  },
  applauseDesc: {
    id: 'app.actionsBar.emojiMenu.applauseDesc',
  },

  // For thumbs up status
  thumbsupLabel: {
    id: 'app.actionsBar.emojiMenu.thumbsupLabel',
  },
  thumbsupDesc: {
    id: 'app.actionsBar.emojiMenu.thumbsupDesc',
  },

  // For thumbs-down status
  thumbsdownLabel: {
    id: 'app.actionsBar.emojiMenu.thumbsdownLabel',
  },
  thumbsdownDesc: {
    id: 'app.actionsBar.emojiMenu.thumbsdownDesc',
  },
  changeStatusLabel: {
    id: 'app.actionsBar.changeStatusLabel'
  },
});

EmojiMenu.propTypes = propTypes;
export default injectIntl(EmojiMenu);
