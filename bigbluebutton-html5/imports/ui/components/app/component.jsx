
import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import LoadingScreen from '../loading-screen/component';
import KickedScreen from '../kicked-screen/component';

import NotificationsBarContainer from '../notifications-bar/container';

import Button from '../button/component';
import styles from './styles';
import cx from 'classnames';

const propTypes = {
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  sidebarRight: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
  captions: PropTypes.element,
  modal: PropTypes.element,
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compactUserList: false, //TODO: Change this on userlist resize (?)
    };
  }

  renderNavBar() {
    const { navbar } = this.props;

    if (navbar) {
      return (
        <header className={styles.navbar}>
          {navbar}
        </header>
      );
    }

    return false;
  }

  renderSidebar() {
    const { sidebar } = this.props;

    if (sidebar) {
      return (
        <aside className={styles.sidebar}>
          {sidebar}
        </aside>
      );
    }

    return false;
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

    if (chat) {
      return (
        <section className={styles.chat} role="log">
          {chat}
        </section>
      );
    }

    return false;
  }

  renderMedia() {
    const { media } = this.props;

    if (media) {
      return (
        <section className={styles.media}>
          {media}
        </section>
      );
    }

    return false;
  }

  renderClosedCaptions() {
    const { captions } = this.props;
    if(captions && this.props.getCaptionsStatus()) {
        return (
          <section className={styles.closedCaptions}>
            {captions}
          </section>
        );
    }
  }

  renderActionsBar() {
    const { actionsbar } = this.props;

    if (actionsbar) {
      return (
        <section className={styles.actionsbar}>
          {actionsbar}
        </section>
      );
    }

    return false;
  }

  renderAudioElement() {
    return (
      <audio id="remote-media" autoPlay="autoplay"></audio>
    );
  }

  renderModal() {
    const { modal } = this.props;

    if (modal) {
      return (<div>{modal}</div>);
    }

    return false;
  }

  render() {
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

    if (this.props.isLoading) {
      return <LoadingScreen/>;
    }

    return (
      <main className={styles.main}>
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
          {this.renderClosedCaptions()}
        </section>
        {this.renderAudioElement()}
        {this.renderModal()}
      </main>
    );
  }
}

App.propTypes = propTypes;
