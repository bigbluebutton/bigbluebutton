import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import WebcamDraggable from './webcam-draggable-overlay/component';
import { styles } from './styles';

const propTypes = {
  children: PropTypes.element.isRequired,
  usersVideo: PropTypes.arrayOf(Array),
  singleWebcam: PropTypes.bool.isRequired,
  hideOverlay: PropTypes.bool,
  swapLayout: PropTypes.bool,
  disableVideo: PropTypes.bool,
  audioModalIsOpen: PropTypes.bool,
  webcamPlacement: PropTypes.string,
};

const defaultProps = {
  usersVideo: [],
  hideOverlay: true,
  swapLayout: false,
  disableVideo: false,
  audioModalIsOpen: false,
  webcamPlacement: 'top',
};


export default class Media extends Component {
  constructor(props) {
    super(props);
    this.refContainer = React.createRef();
  }

  componentWillUpdate() {
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    const {
      swapLayout,
      singleWebcam,
      hideOverlay,
      disableVideo,
      children,
      audioModalIsOpen,
      usersVideo,
      webcamPlacement,
    } = this.props;

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: (webcamPlacement === 'floating'),
    });

    const containerClassName = cx({
      [styles.containerV]: webcamPlacement === 'top' || webcamPlacement === 'bottom' || webcamPlacement === 'floating',
      [styles.containerH]: webcamPlacement === 'left' || webcamPlacement === 'right',
    });

    return (
      <div
        id="container"
        className={containerClassName}
        ref={this.refContainer}
      >
        <div
          className={!swapLayout ? contentClassName : overlayClassName}
          style={{
            maxHeight: (
              webcamPlacement === 'left'
              || webcamPlacement === 'right'
              || webcamPlacement === 'floating'
            )
              ? '100%'
              : '80%',
            minHeight: '20%',
            maxWidth: (
              webcamPlacement === 'top'
              || webcamPlacement === 'bottom'
              || webcamPlacement === 'floating'
            )
              ? '100%'
              : '80%',
            minWidth: '20%',
          }}
        >
          {children}
        </div>
        <WebcamDraggable
          refMediaContainer={this.refContainer}
          swapLayout={swapLayout}
          singleWebcam={singleWebcam}
          usersVideoLenght={usersVideo.length}
          hideOverlay={hideOverlay}
          disableVideo={disableVideo}
          audioModalIsOpen={audioModalIsOpen}
          usersVideo={usersVideo}
        />
      </div>
    );
  }
}

Media.propTypes = propTypes;
Media.defaultProps = defaultProps;
