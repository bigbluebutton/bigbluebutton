import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import { ENTER } from '/imports/utils/keyCodes';
import toastStyles from '/imports/ui/components/toast/styles';
import { styles } from './styles';

const messages = defineMessages({
  lowerHandsLabel: {
    id: 'app.statusNotifier.lowerHands',
    description: 'text displayed to clear all raised hands',
  },
  raisedHandsTitle: {
    id: 'app.statusNotifier.raisedHandsTitle',
    description: 'heading for raised hands toast',
  },
  raisedHandDesc: {
    id: 'app.statusNotifier.raisedHandDesc',
    description: 'label for user with raised hands',
  },
  and: {
    id: 'app.statusNotifier.and',
    description: 'used as conjunction word',
  },
});

const MAX_AVATAR_COUNT = 3;

class StatusNotifier extends Component {
  constructor(props) {
    super(props);

    this.statusNotifierId = null;

    this.audio = new Audio(`${Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename}/resources/sounds/bbb-handRaise.mp3`);

    this.renderRaisedHands = this.renderRaisedHands.bind(this);
    this.getRaisedHandNames = this.getRaisedHandNames.bind(this);
    this.raisedHandAvatars = this.raisedHandAvatars.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      emojiUsers, raiseHandAudioAlert, raiseHandPushAlert, status, isViewer,
    } = this.props;

    if (isViewer) {
      if (this.statusNotifierId) toast.dismiss(this.statusNotifierId);
      return false;
    }

    switch (status) {
      case 'raiseHand':
        if (emojiUsers.length === 0) return toast.dismiss(this.statusNotifierId);

        if (raiseHandAudioAlert && emojiUsers.length > prevProps.emojiUsers.length) {
          this.audio.play();
        }

        if (raiseHandPushAlert) {
          if (this.statusNotifierId) {
            return toast.update(this.statusNotifierId, {
              render: this.renderRaisedHands(),
            });
          }

          this.statusNotifierId = toast(this.renderRaisedHands(), {
            onClose: () => { this.statusNotifierId = null; },
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            className: toastStyles.actionToast,
          });
        }
        break;
      default:
        break;
    }

    return true;
  }

  getRaisedHandNames() {
    const { emojiUsers, intl } = this.props;
    if (emojiUsers.length === 0) return '';

    const _names = emojiUsers.map(u => u.name);
    const { length } = _names;
    const and = intl.formatMessage(messages.and);
    let formattedNames = '';

    switch (length) {
      case 1:
        formattedNames = _names;
        break;
      case 2:
        formattedNames = _names.join(` ${and} `);
        break;
      case 3:
        formattedNames = _names.slice(0, length - 1).join(', ');
        formattedNames += ` ${and} ${_names.slice(length - 1)}`;
        break;
      default:
        formattedNames = _names.slice(0, MAX_AVATAR_COUNT).join(', ');
        formattedNames += ` ${and} ${length - MAX_AVATAR_COUNT}+ `;
        break;
    }

    return intl.formatMessage(messages.raisedHandDesc, { 0: formattedNames });
  }

  raisedHandAvatars() {
    const { emojiUsers, clearUserStatus } = this.props;
    let users = emojiUsers;
    if (emojiUsers.length > MAX_AVATAR_COUNT) users = users.slice(0, MAX_AVATAR_COUNT);

    const avatars = users.map(u => (
      <div
        role="button"
        tabIndex={0}
        className={styles.avatar}
        style={{ backgroundColor: `${u.color}` }}
        onClick={() => clearUserStatus(u.userId)}
        onKeyDown={e => (e.keyCode === ENTER ? clearUserStatus(u.userId) : null)}
        key={`statusToastAvatar-${u.userId}`}
      >
        {u.name.slice(0, 2)}
      </div>
    ));

    if (emojiUsers.length > MAX_AVATAR_COUNT) {
      avatars.push(
        <div
          className={styles.avatarsExtra}
          key={`statusToastAvatar-${emojiUsers.length}`}
        >
          {emojiUsers.length}
        </div>,
      );
    }

    return avatars;
  }

  renderRaisedHands() {
    const { emojiUsers, intl, clearUserStatus } = this.props;
    const formattedRaisedHands = this.getRaisedHandNames();
    return (
      <div>
        <div className={styles.toastIcon}>
          <div className={styles.iconWrapper}>
            <Icon iconName="hand" />
          </div>
        </div>
        <div className={styles.avatarsWrapper}>
          {this.raisedHandAvatars()}
        </div>
        <div className={styles.toastMessage}>
          <div>{intl.formatMessage(messages.raisedHandsTitle)}</div>
          {formattedRaisedHands}
        </div>
        <div className={toastStyles.separator} />
        <Button
          className={styles.clearBtn}
          label={intl.formatMessage(messages.lowerHandsLabel)}
          color="default"
          size="md"
          onClick={() => {
            emojiUsers.map(u => clearUserStatus(u.userId));
          }}
        />
      </div>
    );
  }

  render() { return null; }
}

export default injectIntl(StatusNotifier);

StatusNotifier.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  clearUserStatus: PropTypes.func.isRequired,
  emojiUsers: PropTypes.instanceOf(Array).isRequired,
  status: PropTypes.string.isRequired,
  raiseHandAudioAlert: PropTypes.bool.isRequired,
  raiseHandPushAlert: PropTypes.bool.isRequired,
};
