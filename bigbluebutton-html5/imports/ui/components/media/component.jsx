import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styles } from './styles';

const propTypes = {
  content: PropTypes.element.isRequired,
  overlay: PropTypes.element,
};

const defaultProps = {
  overlay: null,
};

export default class Media extends Component {
  renderContent() {
    const { content } = this.props;

    return content;
  }

  renderOverlay() {
    const { overlay } = this.props;

    if (overlay) {
      return (
        <div className={styles.overlayWrapper}>
          <div className={styles.overlayRatio}>
            <div className={styles.overlay}>
              {overlay}
            </div>
          </div>
        </div>
      );
    }

    return false;
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
