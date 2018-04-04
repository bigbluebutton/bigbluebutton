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

    return overlay;
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
