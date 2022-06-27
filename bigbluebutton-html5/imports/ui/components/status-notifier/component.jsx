import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import Icon from '/imports/ui/components/common/icon/component';
import { ENTER } from '/imports/utils/keyCodes';
import Styled from './styles';
import {Meteor} from "meteor/meteor";
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const messages = defineMessages({
  lowerHandsLabel: {
    id: 'app.statusNotifier.lowerHands',
    description: 'text displayed to clear all raised hands',
  },
  lowerHandDescOneUser: {
    id: 'app.statusNotifier.lowerHandDescOneUser',
    description: 'text displayed to clear a single user raised hands',
  },
  raisedHandsTitle: {
    id: 'app.statusNotifier.raisedHandsTitle',
    description: 'heading for raised hands toast',
  },
  raisedHandDesc: {
    id: 'app.statusNotifier.raisedHandDesc',
    description: 'label for multiple users with raised hands',
  },
  raisedHandDescOneUser: {
    id: 'app.statusNotifier.raisedHandDescOneUser',
    description: 'label for a single user with raised hand',
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

    this.audio = new Audio(`${Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename + Meteor.settings.public.app.instanceId}/resources/sounds/bbb-handRaise.mp3`);

    this.renderRaisedHands = this.renderRaisedHands.bind(this);
    this.getRaisedHandNames = this.getRaisedHandNames.bind(this);
    this.raisedHandAvatars = this.raisedHandAvatars.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      emojiUsers, raiseHandAudioAlert, raiseHandPushAlert, status, isViewer, isPresenter,
    } = this.props;

    if (isViewer && !isPresenter) {
      if (this.statusNotifierId) toast.dismiss(this.statusNotifierId);
      return false;
    }

    switch (status) {
      case 'raiseHand':
        if (emojiUsers.length === 0) {
          return this.statusNotifierId ? toast.dismiss(this.statusNotifierId) : null;
        }

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
            className: "raiseHandToast",
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

    const raisedHandMessageString
        = length === 1 ? messages.raisedHandDescOneUser : messages.raisedHandDesc;
    return intl.formatMessage(raisedHandMessageString, { 0: formattedNames });
  }

  raisedHandAvatars() {
    const { emojiUsers, clearUserStatus, intl } = this.props;
    let users = emojiUsers;
    if (emojiUsers.length > MAX_AVATAR_COUNT) users = users.slice(0, MAX_AVATAR_COUNT);

    const avatars = users.map(u => (
      <TooltipContainer
        key={`statusToastAvatar-${u.userId}`}
        title={intl.formatMessage(messages.lowerHandDescOneUser, { 0: u.name })}>
        <Styled.Avatar
          role="button"
          tabIndex={0}
          style={{ backgroundColor: `${u.color}` }}
          onClick={() => clearUserStatus(u.userId)}
          onKeyDown={e => (e.keyCode === ENTER ? clearUserStatus(u.userId) : null)}
          data-test="avatarsWrapperAvatar"
        >
          {u.name.slice(0, 2)}
        </Styled.Avatar>
      </TooltipContainer>
    ));

    if (emojiUsers.length > MAX_AVATAR_COUNT) {
      avatars.push(
        <Styled.AvatarsExtra key={`statusToastAvatar-${emojiUsers.length}`}>
          {emojiUsers.length}
        </Styled.AvatarsExtra>,
      );
    }

    return avatars;
  }

  renderRaisedHands() {
    const { emojiUsers, intl, clearUserStatus } = this.props;
    const formattedRaisedHands = this.getRaisedHandNames();
    return (
      <div>
        <Styled.ToastIcon>
          <Styled.IconWrapper>
            <Icon iconName="hand" />
          </Styled.IconWrapper>
        </Styled.ToastIcon>
        <Styled.AvatarsWrapper data-test="avatarsWrapper">
          {this.raisedHandAvatars()}
        </Styled.AvatarsWrapper>
        <Styled.ToastMessage>
          <div>{intl.formatMessage(messages.raisedHandsTitle)}</div>
          {formattedRaisedHands}
        </Styled.ToastMessage>
        <Styled.ToastSeparator />
        <Styled.ClearButton
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
