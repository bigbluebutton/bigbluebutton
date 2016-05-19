import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import styles from '../styles.scss';
import { Link } from 'react-router';
import classNames from 'classnames';
let cx = classNames.bind(styles);

export default class ChatListItem extends Component {
  render() {
    let user = this.props.user;

    let audioChatIcons = null;

    if (user.isVoiceUser || user.isListenOnly) {
      audioChatIcons = user.isListenOnly ? <i className='icon-bbb-listen'></i> : <i className='icon-bbb-audio'></i>;
    }

    return (
      <li tabIndex='0' className={styles.userListItem}>
        {this.renderThumbnail()}
        <div className={styles.userName}>
          <h3>{user.name}</h3>
          {user.isPresenter ? <p>
            <FormattedMessage
              id="app.userlist.presenter"
              description="Title for the Header"
              defaultMessage="Participants"
            />
            </p> : null}
          {user.isCurrent ? <p>(
            <FormattedMessage
              id="app.userlist.you"
              description="Title for the Header"
              defaultMessage="Participants"
            />
          )</p> : null}
        </div>
        <div className={styles.userIcons}>
          <span>
            {user.isSharingWebcam ? <i className='icon-bbb-video'></i> : null}
          </span>
            <span>
              {audioChatIcons}
            </span>
          <span>
            <i className='icon-bbb-more rotate-quarter'></i>
          </span>
        </div>
      </li>
    );
  }

  renderThumbnail() {
    let user = this.props.user;
    let thumbnailClasses = cx({
      thumbnail: true,
      presenter: user.isPresenter,
      voiceUser: user.isVoiceUser,
      moderator: user.isModerator,
      image: user.image
    });

    let fetchedClasses = [];
    thumbnailClasses.split(' ').forEach(c => {
      fetchedClasses.push(styles[c]);
    });

    fetchedClasses = fetchedClasses.join(' ');

    let thumbnail = null;

    if(user.image) {
      thumbnail = (
        <div className={styles.thumbnailContainer}>
          <img src={user.image}/>
        </div>
      );
    } else {
      thumbnail = (
        <div className={fetchedClasses}>
          {user.name.slice(0, 1)}
        </div>
      )
    }

    return thumbnail;
  }
}
