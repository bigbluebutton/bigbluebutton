import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Button from '/imports/ui/components/common/button/component';
import Styled from './styles';
import { EMOJI_STATUSES } from '/imports/utils/statuses';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  shortcuts: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  shortcuts: {},
};

const intlMessages = defineMessages({
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'label for option to show emoji menu',
  },
  clearStatusLabel: {
    id: 'app.actionsBar.emojiMenu.noneLabel',
    description: 'label for status clearing',
  },
  raiseHandLabel: {
    id: 'app.actionsBar.emojiMenu.raiseHandLabel',
    description: 'label for raise hand status',
  },
  lowerHandLabel: {
    id: 'app.actionsBar.emojiMenu.lowerHandLabel',
    description: 'label for lower hand',
  },
});

class RaiseHandDropdown extends PureComponent {

  getAvailableActions() {
    const {
      userId,
      getEmojiList,
      setEmojiStatus,
      intl,
    } = this.props;

    const actions = [];
    const statuses = Object.keys(getEmojiList);

    statuses.forEach((s) => {
      actions.push({
        key: s,
        label: intl.formatMessage({ id: `app.actionsBar.emojiMenu.${s}Label` }),
        onClick: () => {
          setEmojiStatus(userId, s);
        },
        icon: getEmojiList[s],
      });
    });
    return actions;
  }

  renderRaiseHandButton() {
    const {
      intl,
      setEmojiStatus,
      currentUser,
      shortcuts,
    } = this.props;

    let btnLabel;
    let btnEmoji;
    if (currentUser.emoji === 'none') {
      btnEmoji = 'raiseHand';
      btnLabel = intlMessages.raiseHandLabel;
    } else if (currentUser.emoji === 'raiseHand') {
      btnEmoji = 'none';
      btnLabel = intlMessages.lowerHandLabel;
    } else {
      btnEmoji = 'none';
      btnLabel = intlMessages.clearStatusLabel;
    }

    return (
      <Button
        icon={EMOJI_STATUSES[currentUser.emoji === 'none'
          ? 'raiseHand' : currentUser.emoji]}
        label={intl.formatMessage(btnLabel)}
        accessKey={shortcuts.raisehand}
        color={currentUser.emoji !== 'none' ? 'primary' : 'default'}
        data-test={currentUser.emoji === 'raiseHand' ? 'lowerHandLabel' : 'raiseHandLabel'}
        ghost={currentUser.emoji === 'none'}
        emoji={currentUser.emoji}
        hideLabel
        circle
        size="lg"
        onClick={(e) => {
          e.stopPropagation();
          setEmojiStatus(currentUser.userId, btnEmoji);
        }}
      />
    );
  }

  render() {
    const {
      intl,
    } = this.props;

    const actions = this.getAvailableActions();

    return (
      <Styled.OffsetBottom>
        {this.renderRaiseHandButton()}
        <BBBMenu
          trigger={(
            <>
              <Styled.HideDropdownButton
                emoji="device_list_selector"
                label={intl.formatMessage(intlMessages.statusTriggerLabel)}
                hideLabel
                tabIndex={0}
                rotate
              />
            </>
            )}
          actions={actions}
        />
      </Styled.OffsetBottom>
    );
  }
}

RaiseHandDropdown.propTypes = propTypes;
RaiseHandDropdown.defaultProps = defaultProps;

export default withShortcutHelper(RaiseHandDropdown, ['raiseHand']);
