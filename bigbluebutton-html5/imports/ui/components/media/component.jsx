import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from './styles';
import VideoProviderContainer from '../video-provider/container';

const propTypes = {
  children: PropTypes.element.isRequired,
  floatingOverlay: PropTypes.bool,
  hideOverlay: PropTypes.bool,
};

const defaultProps = {
  floatingOverlay: false,
  hideOverlay: true,
};

export default class Media extends Component {
  componentWillUpdate() {
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    const {
      swapLayout, floatingOverlay, hideOverlay, disableVideo,
    } = this.props;

    const contentClassName = cx({
      [styles.content]: true,
      [styles.hasOverlay]: !hideOverlay,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: floatingOverlay,
    });

    return (
      <div className={styles.container}>
        <div className={!swapLayout ? contentClassName : overlayClassName}>
          {this.props.children}
        </div>
        <div className={!swapLayout ? overlayClassName : contentClassName}>
          { !disableVideo ? <VideoProviderContainer /> : null }
        </div>
      </div>
    );
  }
}

Media.propTypes = propTypes;
Media.defaultProps = defaultProps;
