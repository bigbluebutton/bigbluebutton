import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import { FormattedMessage, FormattedDate } from 'react-intl';

const propTypes = {
  content: PropTypes.element.isRequired,
  overlay: PropTypes.element,
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
