import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import cx from 'classnames';

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
    avatarClasses[styles.presenter] = user.isPresenter;
    avatarClasses[styles.voiceUser] = user.isVoiceUser;
    avatarClasses[styles.moderator] = user.isModerator;

    return (
      <div className={cx(avatarClasses, styles.userAvatar)}>
        <span>
          {user.name.slice(0, 2)}
        </span>
      </div>
    );
  }
}

UserAvatar.propTypes = propTypes;
UserAvatar.defaultProps = defaultProps;
