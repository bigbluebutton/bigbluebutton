import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import NotificationsBarContainer from '../notifications-bar/container';
import AudioNotificationContainer from '../audio/audio-notification/container';
import AudioContainer from '../audio/container';
import ChatNotificationContainer from '../chat/notification/container';

import styles from './styles';
import cx from 'classnames';

const intlMessages = defineMessages({
  userListLabel: {
    id: 'app.userlist.Label',
    description: 'Aria-label for Userlist Nav',
  },
  chatLabel: {
    id: 'app.chat.Label',
    description: 'Aria-label for Chat Section'
  },
  mediaLabel: {
    id: 'app.media.Label',
    description: 'Aria-label for Media Section'
  },
  actionsbarLabel: {
    id: 'app.actionsBar.Label',
    description: 'Aria-label for ActionsBar Section'
  },
});

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

class App extends Component {
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
    let { userList, intl } = this.props;
    const { compactUserList } = this.state;

    if (!userList) return;

    let userListStyle = {};
    userListStyle[styles.compact] = compactUserList;
    userList = React.cloneElement(userList, {
      compact: compactUserList,
    });

    return (
      <nav
        className={cx(styles.userList, userListStyle)}
        aria-label={intl.formatMessage(intlMessages.userListLabel)}>
          {userList}
      </nav>
    );
  }

  renderChat() {
    const { chat, intl } = this.props;

    if (!chat) return null;

    return (
      <section
        className={styles.chat}
        role="region"
        aria-label={intl.formatMessage(intlMessages.chatLabel)}>
          {chat}
      </section>
    );
  }

  renderMedia() {
    const { media, intl } = this.props;

    if (!media) return null;

    return (
      <section
        className={styles.media}
        role="region"
        aria-label={intl.formatMessage(intlMessages.mediaLabel)}>
          {media}
      </section>
    );
  }

  renderActionsBar() {
    const { actionsbar, intl } = this.props;

    if (!actionsbar) return null;

    return (
      <section
        className={styles.actionsbar}
        role="region"
        aria-label={intl.formatMessage(intlMessages.actionsbarLabel)}>
          {actionsbar}
      </section>
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
        <AudioContainer />
        <ChatNotificationContainer currentChatID={params.chatID} />
      </main>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;
export default injectIntl(App);
