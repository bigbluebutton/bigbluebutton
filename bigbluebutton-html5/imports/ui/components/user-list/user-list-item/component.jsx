import React, { Component } from 'react';
import UserAvatar from '../../user-avatar/component';
import { FormattedMessage } from 'react-intl';
import styles from './styles.scss';
import { Link } from 'react-router';
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

export default class ChatListItem extends Component {
  render() {
    return (
      <li tabIndex='0' className={styles.userListItem}>
        <UserAvatar user={this.props.user}/>
        {this.renderUserName()}
        {this.renderUserIcons()}
      </li>
    );
  }

  renderUserName() {
    let user = this.props.user;

    let userNameSub = null;
    if(user.isPresenter) {
      userNameSub = (
        <p className={styles.userNameSub}>
          <FormattedMessage
            id="app.userlist.presenter"
            description="Text for identifying presenter user"
            defaultMessage="Presenter"
          />
        </p>
      );
    } else if(user.isCurrent) {
      userNameSub = (
        <p className={styles.userNameSub}>
          (<FormattedMessage
            id="app.userlist.you"
            description="Text for identifying your user"
            defaultMessage="You"
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

    let audioChatIcon = null;
    if (user.isVoiceUser || user.isListenOnly) {
      if(user.isMuted) {
        audioChatIcon = 'icon-bbb-audio-off';
      } else {
        audioChatIcon = user.isListenOnly ? 'icon-bbb-listen' : 'icon-bbb-audio';
      }
    }

    return (
      <div className={styles.userIcons}>
        <span className={styles.userIconsContainer}>
          {user.isSharingWebcam ? <i className='icon-bbb-video'></i> : null}
        </span>
        <span className={styles.userIconsContainer}>
          <i className={audioChatIcon}></i>
        </span>
        <span className={cx(styles.userIconsContainer, styles.cursorPointer)}>
          <i className='icon-bbb-more rotate-quarter'></i>
        </span>
      </div>
    )
  }
}
