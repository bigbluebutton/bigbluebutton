import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

const propTypes = {
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  sidebarRight: PropTypes.element,
  media: PropTypes.element,
  sideMedia: PropTypes.element,
  actionsbar: PropTypes.element,
};

export default class App extends Component {
  renderNavbar() {
    const { navbar } = this.props;

    if(navbar) {
      return (
        <header className="navbar">
          {navbar}
        </header>
      );
    } else {
      return 'oi';
    }

    return false;
  }

  renderSidebar(isRight = false) {
    const sidebar = this.props[isRight ? 'sidebarRight' : 'sidebar'];

    if(sidebar) {
      return (
        <aside className={classNames({
          sidebar: true,
          sidebarRight: isRight,
        })}>
          {sidebar}
        </aside>
      );
    }

    return false;
  }

  renderMedia() {
    const { media } = this.props;

    if(media) {
      return (
        <section className="media">
          {media}
          {this.renderSideMedia()}
        </section>
      );
    }

    return false;
  }

  renderSideMedia() {
    const { sideMedia } = this.props;

    if(sideMedia) {
      return (
        <section className="sideMedia">
          {sideMedia}
        </section>
      );
    }

    return false;
  }

  renderActionsbar() {
    const { actionsbar } = this.props;

    if(actionsbar) {
      return (
        <section className="actions">
          {actionsbar}
        </section>
      );
    }

    return false;
  }

  render() {
    return (
      <main className="main">
        {this.renderNavbar()}
        <section className="wrap">
          {this.renderSidebar()}
          <div className="content">
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
