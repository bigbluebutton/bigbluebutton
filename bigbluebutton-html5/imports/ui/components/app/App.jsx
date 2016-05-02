import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import styles from './styles';

const propTypes = {
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  sidebarRight: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
};

export default class App extends Component {
  renderNavbar() {
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

  renderSidebar(isRight = false) {
    const propName = isRight ? 'sidebarRight' : 'sidebar';
    let sidebar = this.props[propName];

    if (sidebar) {
      return (
        <aside className={styles[propName]}>
          {sidebar}
        </aside>
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

  renderActionsbar() {
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
        {this.renderNavbar()}
        <section className={styles.wrapper}>
          {this.renderSidebar()}
          <div className={styles.content}>
            {this.renderMedia()}
            {this.renderActionsbar()}
          </div>
          {this.renderSidebar(true)}
        </section>
      </main>
    );
  }
}

App.propTypes = propTypes;
