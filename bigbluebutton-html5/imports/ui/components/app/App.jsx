import React, { Component, PropTypes } from 'react';
import styles from './styles';

const propTypes = {
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  sidebarRight: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
};

export default class App extends Component {
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
    const { userList } = this.props;

    if (userList) {
      return (
        <nav className={styles.userList}>
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

  render() {
    return (
      <main className={styles.main}>
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
      </main>
    );
  }
}

App.propTypes = propTypes;
