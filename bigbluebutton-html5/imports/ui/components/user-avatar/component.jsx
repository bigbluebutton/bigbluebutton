import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import cx from 'classnames';
import getColor from './color-generator';

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
    let user = this.props.user;

    let avatarClasses = {};
    avatarClasses[styles.moderator] = user.isModerator;
    avatarClasses[styles.presenter] = user.isPresenter;
    // avatarClasses[styles.guest] = user.isVoiceUser;

    let avatarStyles = {
      'background-color': getColor(user.name),
    };

    return (
      <div className={styles.userAvatar} style={avatarStyles}>
        <span>
          {user.name.slice(0, 2)}
        </span>
        <span className={cx(styles.userStatus, avatarClasses)}>
        </span>
      </div>
    );
  }
}

UserAvatar.propTypes = propTypes;
UserAvatar.defaultProps = defaultProps;
