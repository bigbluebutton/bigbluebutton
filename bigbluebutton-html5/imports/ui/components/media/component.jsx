import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from './styles';

const propTypes = {
  content: PropTypes.element.isRequired,
  overlay: PropTypes.element,
  floatingOverlay: PropTypes.bool,
  hideOverlay: PropTypes.bool,
};

const defaultProps = {
  overlay: null,
  floatingOverlay: false,
  hideOverlay: true,
};

export default class Media extends Component {
  renderContent() {
    const { content, hideOverlay } = this.props;

    return (
      <div
        className={cx({
          [styles.content]: true,
          [styles.hasOverlay]: !hideOverlay,
        })}
      >
        {content}
      </div>
    );
  }

  renderOverlay() {
    const { overlay, floatingOverlay, hideOverlay } = this.props;

    if (!overlay) return null;

    return (
      <div
        className={cx({
          [styles.overlay]: true,
          [styles.hideOverlay]: hideOverlay,
          [styles.floatingOverlay]: floatingOverlay,
        })}
      >
        {overlay}
      </div>
    );
  }

  render() {
    return (
      <div className={styles.container}>
        {this.props.children}
        {this.renderContent()}
        {this.renderOverlay()}
      </div>
    );
  }
}

Media.propTypes = propTypes;
Media.defaultProps = defaultProps;
