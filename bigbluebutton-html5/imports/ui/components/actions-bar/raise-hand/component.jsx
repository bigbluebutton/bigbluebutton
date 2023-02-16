import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Button from '/imports/ui/components/common/button/component';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  shortcuts: '',
};

const intlMessages = defineMessages({
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'label for option to show emoji menu',
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

    return (
      <Button
        icon="hand"
        label={intl.formatMessage({
          id: `app.actionsBar.emojiMenu.${
            currentUser.emoji === 'raiseHand'
              ? 'lowerHandLabel'
              : 'raiseHandLabel'
          }`,
        })}
        accessKey={shortcuts.raisehand}
        color={currentUser.emoji === 'raiseHand' ? 'primary' : 'default'}
        data-test={currentUser.emoji === 'raiseHand' ? 'lowerHandLabel' : 'raiseHandLabel'}
        ghost={currentUser.emoji !== 'raiseHand'}
        emoji={currentUser.emoji}
        hideLabel
        circle
        size="lg"
        onClick={(e) => {
          e.stopPropagation();
          setEmojiStatus(
            currentUser.userId,
            currentUser.emoji === 'raiseHand' ? 'none' : 'raiseHand',
          );
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
