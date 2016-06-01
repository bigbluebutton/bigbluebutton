import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import cx from 'classnames';

export default class UserAvatar extends Component {
  render() {
    let user = this.props.user;

    let avatarClasses = {};
    avatarClasses[styles.presenter] = user.isPresenter;
    avatarClasses[styles.voiceUser] = user.isVoiceUser;
    avatarClasses[styles.moderator] = user.isModerator;
    // avatarClasses[styles.image] = user.image;

    return  (
      <div className={cx(avatarClasses, styles.userAvatar)}>
        <span>
          {user.name.slice(0, 1)}
        </span>
      </div>
    )
  }
}
