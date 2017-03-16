import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

import KickedScreen from '../kicked-screen/component';

import NotificationsBarContainer from '../notifications-bar/container';
import AudioNotificationContainer from '../audio-notification/container';

import Button from '../button/component';
import styles from './styles';
import cx from 'classnames';

const propTypes = {
  init: PropTypes.func.isRequired,
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
  modal: PropTypes.element,
  unreadMessageCount: PropTypes.array,
  openChats: PropTypes.array,
};

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      compactUserList: false, //TODO: Change this on userlist resize (?)
    };

    this.notificationAudio = new Audio('/html5client/resources/sounds/notify.mp3');

    props.init.call(this);
  }

  setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  };

  componentDidMount() {
    this.setHtmlFontSize(this.props.fontSize);
  }

  renderNavBar() {
    const { navbar } = this.props;

    if (!navbar) return null;

    return (
      <header className={styles.navbar}>
        {navbar}
      </header>
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

    let userListStyle = {};
    userListStyle[styles.compact] = compactUserList;
    if (userList) {
      userList = React.cloneElement(userList, {
        compact: compactUserList,
      });

      return (
        <nav className={cx(styles.userList, userListStyle)}>
          {userList}
        </nav>
      );
    }

    return false;
  }

  renderChat() {
    const { chat } = this.props;

    if (!chat) return null;

    return (
      <section className={styles.chat} role="log">
        {chat}
      </section>
    );
  }

  renderMedia() {
    const { media } = this.props;

    if (!media) return null;

    return (
      <section className={styles.media}>
        {media}
      </section>
    );
  }

  renderActionsBar() {
    const { actionsbar } = this.props;

    if (!actionsbar) return null;

    return (
      <section className={styles.actionsbar}>
        {actionsbar}
      </section>
    );
  }

  playNotificationSound() {
    const wait = notificationAudio || 1;
    _.debounce(this.notificationSound.play, wait * 1000);
  }

  componentDidUpdate(prevProps) {
  }

  render() {
    const { modal } = this.props;

    if (this.props.wasKicked) {
      return (
        <KickedScreen>
          <FormattedMessage
            id="app.kickMessage"
            description="Message when the user is kicked out of the meeting"
            defaultMessage="You have been kicked out of the meeting"
          />
          <br/><br/>
          <Button
            label={'OK'}
            onClick={this.props.redirectToLogoutUrl}/>
        </KickedScreen>
      );
    }

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
        <audio id="remote-media" autoPlay="autoplay"></audio>
        {modal}
      </main>
    );
  }
}

App.propTypes = propTypes;
