import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import Icon from '/imports/ui/components/common/icon/component';
import { ENTER } from '/imports/utils/keyCodes';
import Styled from './styles';
import { Meteor } from 'meteor/meteor';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

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

class RaiseHandNotifier extends Component {
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
      raiseHandUsers, raiseHandAudioAlert, raiseHandPushAlert, isViewer, isPresenter,
    } = this.props;

    if (isViewer && !isPresenter) {
      if (this.statusNotifierId) toast.dismiss(this.statusNotifierId);
      return false;
    }

    if (raiseHandUsers.length === 0) {
      return this.statusNotifierId ? toast.dismiss(this.statusNotifierId) : null;
    }

    if (raiseHandAudioAlert && raiseHandUsers.length > prevProps.raiseHandUsers.length) {
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
        className: 'raiseHandToast',
      });
    }

    return true;
  }

  getRaisedHandNames() {
    const { raiseHandUsers, intl } = this.props;
    if (raiseHandUsers.length === 0) return '';

    const _names = raiseHandUsers.map((u) => u.name);
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

    const raisedHandMessageString = length === 1
      ? messages.raisedHandDescOneUser : messages.raisedHandDesc;
    return intl.formatMessage(raisedHandMessageString, { 0: formattedNames });
  }

  raisedHandAvatars() {
    const { raiseHandUsers, lowerUserHands, intl } = this.props;
    let users = raiseHandUsers;
    if (raiseHandUsers.length > MAX_AVATAR_COUNT) users = users.slice(0, MAX_AVATAR_COUNT);

    const avatars = users.map((u) => (
      <TooltipContainer
        key={`statusToastAvatar-${u.userId}`}
        title={intl.formatMessage(messages.lowerHandDescOneUser, { 0: u.name })}
      >
        <Styled.Avatar
          role="button"
          tabIndex={0}
          style={{ backgroundColor: `${u.color}` }}
          onClick={() => lowerUserHands(u.userId)}
          onKeyDown={(e) => (e.keyCode === ENTER ? lowerUserHands(u.userId) : null)}
          data-test="avatarsWrapperAvatar"
          moderator={u.role === ROLE_MODERATOR}
          avatar={u.avatar}
        >
          {u.name.slice(0, 2)}
        </Styled.Avatar>
      </TooltipContainer>
    ));

    if (raiseHandUsers.length > MAX_AVATAR_COUNT) {
      avatars.push(
        <Styled.AvatarsExtra key={`statusToastAvatar-${raiseHandUsers.length}`}>
          {raiseHandUsers.length}
        </Styled.AvatarsExtra>,
      );
    }

    return avatars;
  }

  renderRaisedHands() {
    const { raiseHandUsers, intl, lowerUserHands } = this.props;
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
            raiseHandUsers.map((u) => lowerUserHands(u.userId));
          }}
          data-test="raiseHandRejection"
        />
      </div>
    );
  }

  render() { return null; }
}

export default injectIntl(RaiseHandNotifier);

RaiseHandNotifier.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  lowerUserHands: PropTypes.func.isRequired,
  raiseHandUsers: PropTypes.instanceOf(Array).isRequired,
  raiseHandAudioAlert: PropTypes.bool.isRequired,
  raiseHandPushAlert: PropTypes.bool.isRequired,
};
