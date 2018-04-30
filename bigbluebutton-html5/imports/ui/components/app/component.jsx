import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Modal from 'react-modal';
import cx from 'classnames';
import Resizable from 're-resizable';

import ToastContainer from '../toast/container';
import ModalContainer from '../modal/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import ChatNotificationContainer from '../chat/notification/container';
import { styles } from './styles';

const intlMessages = defineMessages({
  userListLabel: {
    id: 'app.userList.label',
    description: 'Aria-label for Userlist Nav',
  },
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  mediaLabel: {
    id: 'app.media.label',
    description: 'Aria-label for Media Section',
  },
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
});

const propTypes = {
  fontSize: PropTypes.string,
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
  closedCaption: PropTypes.element,
  userList: PropTypes.element,
  chat: PropTypes.element,
  locale: PropTypes.string,
  intl: intlShape.isRequired,
};

const defaultProps = {
  fontSize: '16px',
  navbar: null,
  sidebar: null,
  media: null,
  actionsbar: null,
  closedCaption: null,
  userList: null,
  chat: null,
  locale: 'en',
};

class App extends Component {
  constructor() {
    super();

    this.state = {
      compactUserList: false, // TODO: Change this on userlist resize (?)
    };
  }

  componentDidMount() {
    const { locale } = this.props;

    Modal.setAppElement('#app');
    document.getElementsByTagName('html')[0].lang = locale;
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

  renderClosedCaption() {
    const { closedCaption } = this.props;

    if (!closedCaption) return null;

    return (
      <div className={styles.closedCaptionBox}>
        {closedCaption}
      </div>
    );
  }

  renderUserList() {
    const { intl, chatIsOpen } = this.props;
    let { userList } = this.props;
    const { compactUserList } = this.state;

    if (!userList) return null;

    const userListStyle = {};
    userListStyle[styles.compact] = compactUserList;
    userList = React.cloneElement(userList, {
      compact: compactUserList,
    });

    return (
      <Resizable
        minWidth="10%"
        maxWidth="20%"
        ref={(node) => { this.resizableUserList = node; }}
        enable={{ right: true }}
        className={styles.resizableUserList}
        onResize={(e, direction, ref, d) => {
          if (e.clientX - ref.offsetLeft <= 50) this.props.router.push('/');
        }}
      >
        <div
          className={cx(styles.userList, userListStyle)}
          aria-label={intl.formatMessage(intlMessages.userListLabel)}
          aria-hidden={chatIsOpen}
        >
          {userList}
        </div>
      </Resizable>
    );
  }

  renderChat() {
    const { chat, intl } = this.props;

    if (!chat) return null;

    return (
      <Resizable
        minWidth="15%"
        maxWidth="30%"
        ref={(node) => { this.resizableChat = node; }}
        className={styles.resizableChat}
        enable={{ right: true }}
      >
        <section
          className={styles.chat}
          aria-label={intl.formatMessage(intlMessages.chatLabel)}
        >
          {chat}
        </section>
      </Resizable>
    );
  }

  renderMedia() {
    const {
      media, intl, chatIsOpen, userlistIsOpen,
    } = this.props;

    if (!media) return null;

    return (
      <section
        className={styles.media}
        aria-label={intl.formatMessage(intlMessages.mediaLabel)}
        aria-hidden={userlistIsOpen || chatIsOpen}
      >
        {media}
        {this.renderClosedCaption()}
      </section>
    );
  }

  renderActionsBar() {
    const {
      actionsbar, intl, userlistIsOpen, chatIsOpen,
    } = this.props;

    if (!actionsbar) return null;

    return (
      <section
        className={styles.actionsbar}
        aria-label={intl.formatMessage(intlMessages.actionsBarLabel)}
        aria-hidden={userlistIsOpen || chatIsOpen}
      >
        {actionsbar}
      </section>
    );
  }

  render() {
    const { params, userlistIsOpen, chatIsOpen } = this.props;

    return (
      <main className={styles.main}>
        <NotificationsBarContainer />
        <section className={styles.wrapper}>
          <div className={styles.content}>
            {this.renderNavBar()}
            {this.renderMedia()}
            {this.renderActionsBar()}
          </div>
          {this.renderUserList()}
          {userlistIsOpen ? <div className={styles.userlistPad} /> : null}
          {this.renderChat()}
          {chatIsOpen ? <div className={styles.chatPad} /> : null}
          {this.renderSidebar()}
        </section>
        <ModalContainer />
        <AudioContainer />
        <ToastContainer />
        <ChatNotificationContainer currentChatID={params.chatID} />
      </main>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;
export default injectIntl(App);
