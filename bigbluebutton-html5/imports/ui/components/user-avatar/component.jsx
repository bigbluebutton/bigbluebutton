import React, { Component, PropTypes } from 'react';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles.scss';
import cx from 'classnames';
import generateColor from './color-generator';

const propTypes = {
  user: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    isPresenter: React.PropTypes.bool.isRequired,
    isVoiceUser: React.PropTypes.bool.isRequired,
    isModerator: React.PropTypes.bool.isRequired,
    isOnline: React.PropTypes.bool.isRequired,
    image: React.PropTypes.string,
  }).isRequired,
};

const defaultProps = {
};

export default class UserAvatar extends Component {
  render() {
    const {
      user,
    } = this.props;

    const avatarColor = user.isOnline ? generateColor(user.name) : '#fff';

    let avatarStyles = {
      backgroundColor: avatarColor,
      boxShadow: user.isTalking ? `0 0 .5rem ${avatarColor}` : 'none',
    };

    return (
      <div className={!user.isLoggedOut ? styles.userAvatar : styles.userLogout}
           style={avatarStyles}>
        <div>
          {this.renderAvatarContent()}
        </div>
        {this.renderUserStatus()}
        {this.renderUserMediaStatus()}
      </div>
    );
  }

  renderAvatarContent() {
    const user = this.props.user;

    let content = <span aria-hidden="true">{user.name.slice(0, 2)}</span>;

    if (user.emoji.status !== 'none') {
      let iconEmoji = undefined;

      switch (user.emoji.status) {
        case 'thumbsUp':
          iconEmoji = 'thumbs_up';
          break;
        case 'thumbsDown':
          iconEmoji = 'thumbs_down';
          break;
        case 'raiseHand':
          iconEmoji = 'hand';
          break;
        case 'away':
          iconEmoji = 'time';
          break;
        case 'neutral':
          iconEmoji = 'undecided';
          break;
        default:
          iconEmoji = user.emoji.status;
      }
      content = <span aria-label={user.emoji.status}><Icon iconName={iconEmoji}/></span>;
    }

    return content;
  }

  renderUserStatus() {
    const user = this.props.user;
    let userStatus;

    let userStatusClasses = {};
    userStatusClasses[styles.moderator] = user.isModerator;
    userStatusClasses[styles.presenter] = user.isPresenter;

    if (user.isModerator || user.isPresenter) {
      userStatus = (
        <span className={cx(styles.userStatus, userStatusClasses)}>
        </span>
      );
    }

    return userStatus;
  }

  renderUserMediaStatus() {
    const user = this.props.user;
    let userMediaStatus;

    let userMediaClasses = {};
    userMediaClasses[styles.voiceOnly] = user.isListenOnly;
    userMediaClasses[styles.microphone] = user.isVoiceUser;

    if (user.isListenOnly || user.isVoiceUser) {
      userMediaStatus = (
        <span className={cx(styles.userMediaStatus, userMediaClasses)}>
          {user.isMuted ? <div className={styles.microphoneMuted}/> : null}
        </span>
      );
    }

    return userMediaStatus;
  }
}

UserAvatar.propTypes = propTypes;
UserAvatar.defaultProps = defaultProps;
