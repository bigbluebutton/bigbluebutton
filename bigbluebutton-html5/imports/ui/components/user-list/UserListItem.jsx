import React, { Component } from 'react';
import styles from './styles.scss';
import { Link } from 'react-router';
import classNames from 'classnames';
let cx = classNames.bind(styles);

export default class ChatListItem extends Component {
  render() {
    let user = this.props.user;
    let thumbnailClasses = cx({
      thumbnail: true,
      presenter: user.isPresenter,
      voiceUser: user.isVoiceUser,
      moderator: user.isModerator
    });

    let fetchedClasses = [];
    thumbnailClasses.split(' ').forEach(c => {
      fetchedClasses.push(styles[c]);
    });

    fetchedClasses = fetchedClasses.join(' ');
    console.log(fetchedClasses);
    return (
      <li tabIndex='0' className={styles.userListItem}>
        <div className={fetchedClasses}>
          {user.name.slice(0, 1)}
        </div>
        <div className={styles.userName}>
          <h3>{user.name}</h3>
          {user.isPresenter ? <p>Presenter</p> : null}
          {user.isCurrent ? <p>(You)</p> : null}
        </div>
        <div className={styles.userIcons}>
          <i className='icon-bbb-video'></i>
        </div>
      </li>
    );
  }
}
