import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

import NotificationsBarContainer from '../notifications-bar/container';
import AudioNotificationContainer from '../audio-notification/container';
import ChatNotificationContainer from '../chat/notification/container';

import Button from '../button/component';
import styles from './styles';
import cx from 'classnames';

const propTypes = {
  init: PropTypes.func.isRequired,
  fontSize: PropTypes.string,
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
  modal: PropTypes.element,
};

const defaultProps = {
  fontSize: '16px',
};

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      compactUserList: false, //TODO: Change this on userlist resize (?)
    };

    props.init.call(this);
  }

  componentDidMount() {
    document.getElementsByTagName('html')[0].style.fontSize = this.props.fontSize;
  }

  renderNavBar() {
    const { navbar } = this.props;

    if (!navbar) return null;

    return (
      <div className={styles.navbar}>
        {navbar}
      </div>
    );
  }

  renderSidebar() {
    const { sidebar } = this.props;

    if (!sidebar) return null;

    return (
      <aside className={styles.sidebar}>
        {sidebar}
      </aside>
    );
  }

  renderUserList() {
    let { userList } = this.props;
    const { compactUserList } = this.state;

    if (!userList) return;

    let userListStyle = {};
    userListStyle[styles.compact] = compactUserList;
    userList = React.cloneElement(userList, {
      compact: compactUserList,
    });

    return (
      <div className={cx(styles.userList, userListStyle)} role="region" aria-label="user list">
        {userList}
      </div>
    );
  }

  renderChat() {
    const { chat } = this.props;

    if (!chat) return null;

    return (
      <div className={styles.chat} role="region" aria-label="chat">
        {chat}
      </div>
    );
  }

  renderMedia() {
    const { media } = this.props;

    if (!media) return null;

    return (
      <div className={styles.media} role="region" aria-label="media">
        {media}
      </div>
    );
  }

  renderActionsBar() {
    const { actionsbar } = this.props;

    if (!actionsbar) return null;

    return (
      <div className={styles.actionsbar} role="region" aria-label="actions bar">
        {actionsbar}
      </div>
    );
  }

  render() {
    const { modal, params } = this.props;

    return (
      <main className={styles.main}>
        <AudioNotificationContainer />
        <NotificationsBarContainer />
        <section className={styles.wrapper}>
          {this.renderUserList()}
          {this.renderChat()}
          <div className={styles.content}>
            {this.renderNavBar()}
            {this.renderMedia()}
            {this.renderActionsBar()}
          </div>
          {this.renderSidebar()}
        </section>
        {modal}
        <audio id="remote-media" autoPlay="autoplay"></audio>
        <ChatNotificationContainer currentChatID={params.chatID} />
      </main>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;
