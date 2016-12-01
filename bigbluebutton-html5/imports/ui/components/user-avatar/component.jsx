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

    const avatarColor = !user.isLoggedOut ? generateColor(user.name) : '#fff';

    let avatarStyles = {
      backgroundColor: avatarColor,
      boxShadow: user.isTalking ? `0 0 .5rem ${avatarColor}` : 'none',
    };

    return (
      <div className={!user.isLoggedOut ? styles.userAvatar : styles.userLogout}
           style={avatarStyles}>
        <span>
          {this.renderAvatarContent()}
        </span>
        {this.renderUserStatus()}
        {this.renderUserMediaStatus()}
      </div>
    );
  }

  renderAvatarContent() {
    const user = this.props.user;

    let content = user.name.slice(0, 2);

    if (user.emoji.status !== 'none') {
      content = <Icon iconName={user.emoji.status}/>;
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
