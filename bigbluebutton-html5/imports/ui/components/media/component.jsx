import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';

import { styles } from './styles';

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

  componentDidUpdate(prevProps) {
    const {
      userWasInWebcam,
      audioModalIsOpen,
      joinVideo,
    } = this.props;

    const {
      audioModalIsOpen: oldAudioModalIsOpen,
    } = prevProps;

    if ((!audioModalIsOpen && oldAudioModalIsOpen) && userWasInWebcam) {
      Session.set('userWasInWebcam', false);
      joinVideo();
    }
  }

  render() {
    const {
      swapLayout,
      floatingOverlay,
      hideOverlay,
      disableVideo,
      children,
      audioModalIsOpen,
    } = this.props;

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: floatingOverlay,
    });

    return (
      <div className={styles.container}>
        <div className={!swapLayout ? contentClassName : overlayClassName}>
          {children}
        </div>
        <div className={!swapLayout ? overlayClassName : contentClassName}>
          { !disableVideo && !audioModalIsOpen ? <VideoProviderContainer /> : null }
        </div>
      </div>
    );
  }
}

Media.propTypes = propTypes;
Media.defaultProps = defaultProps;
