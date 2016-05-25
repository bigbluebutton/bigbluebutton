import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import styles from '../styles.scss';
import { Link } from 'react-router';
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

export default class ChatListItem extends Component {
  render() {
    return (
      <li tabIndex='0' className={styles.userListItem}>
        {this.renderThumbnail()}
        {this.renderUserName()}
        {this.renderUserIcons()}
      </li>
    );
  }

  renderThumbnail() {
    let user = this.props.user;

    let thumbnailClasses = {};
    thumbnailClasses[styles.presenter] = user.isPresenter;
    thumbnailClasses[styles.voiceUser] = user.isVoiceUser;
    thumbnailClasses[styles.moderator] = user.isModerator;
    thumbnailClasses[styles.image] = user.image;

    return  (
      <div className={cx(thumbnailClasses, styles.thumbnail)}>
        {user.name.slice(0, 1)}
      </div>
    )
  }

  renderUserName() {
    let user = this.props.user;

    let userNameSub = null;
    if(user.isPresenter) {
      userNameSub = (
        <p className={styles.userNameSub}>
          <FormattedMessage
            id="app.userlist.presenter"
            description="Title for the Header"
            defaultMessage="Participants"
          />
        </p>
      );
    } else if(user.isCurrent) {
      userNameSub = (
        <p className={styles.userNameSub}>
          (<FormattedMessage
            id="app.userlist.you"
            description="Title for the Header"
            defaultMessage="Participants"
          />)
          </p>
      );
    }

    return (
      <div className={styles.userName}>
        <h3 className={styles.userNameMain}>
          {user.name}
        </h3>
        {userNameSub}
      </div>
    )
  }

  renderUserIcons() {
    let user = this.props.user;

    let audioChatIcons = null;

    if (user.isVoiceUser || user.isListenOnly) {
      audioChatIcons = user.isListenOnly ? <i className='icon-bbb-listen'></i> : <i className='icon-bbb-audio'></i>;
    }

    return (
      <div className={styles.userIcons}>
        <span className={styles.userIconsContainer}>
          {user.isSharingWebcam ? <i className='icon-bbb-video'></i> : null}
        </span>
        <span className={styles.userIconsContainer}>
          {audioChatIcons}
        </span>
        <span className={styles.userIconsContainer}>
          <i className='icon-bbb-more rotate-quarter'></i>
        </span>
      </div>
    )
  }
}
