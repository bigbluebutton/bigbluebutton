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
});

class RaiseHandDropdown extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isHandRaised: false,
    };
  }

  getAvailableActions() {
    const {
      userId,
      getEmojiList,
      setEmojiStatus,
      intl,
      currentUser,
    } = this.props;

    const actions = [];
    const statuses = Object.keys(getEmojiList);

    statuses.forEach((s) => {
      actions.push({
        key: s,
        label: intl.formatMessage({ id: `app.actionsBar.emojiMenu.${s}Label` }),
        onClick: () => {
          if (currentUser.emoji === 'raiseHand') {
            this.setState({
              isHandRaised: true,
            });
          }
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

    const {
      isHandRaised,
    } = this.state;

    const label = currentUser.emoji !== 'raiseHand' && currentUser.emoji !== 'none'
      ? intlMessages.clearStatusLabel
      : {id: `app.actionsBar.emojiMenu.${
        currentUser.emoji === 'raiseHand'
          ? 'lowerHandLabel'
          : 'raiseHandLabel'
      }`,
      };

    return (
      <Button
        icon={EMOJI_STATUSES[currentUser.emoji === 'none'
          ? 'raiseHand' : currentUser.emoji]}
        label={intl.formatMessage(
          label,
        )}
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
          if (currentUser.emoji !== 'none'
          && currentUser.emoji !== 'raiseHand') {
            setEmojiStatus(
              currentUser.userId,
              isHandRaised ? 'raiseHand' : 'none',
            );
          } else {
            this.setState({
              isHandRaised: false,
            });
            setEmojiStatus(
              currentUser.userId,
              currentUser.emoji === 'raiseHand' ? 'none' : 'raiseHand',
            );
          }
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
