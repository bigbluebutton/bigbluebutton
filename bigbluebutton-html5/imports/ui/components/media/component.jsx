import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { isMobile, isIPad13 } from 'react-device-detect';
import WebcamDraggable from './webcam-draggable-overlay/component';
import { styles } from './styles';
import Storage from '../../services/storage/session';

const BROWSER_ISMOBILE = isMobile || isIPad13;

const propTypes = {
  children: PropTypes.element.isRequired,
  usersVideo: PropTypes.arrayOf(Array),
  singleWebcam: PropTypes.bool.isRequired,
  hideOverlay: PropTypes.bool,
  swapLayout: PropTypes.bool,
  disableVideo: PropTypes.bool,
  audioModalIsOpen: PropTypes.bool,
  webcamDraggableState: PropTypes.instanceOf(Object).isRequired,
};

const defaultProps = {
  usersVideo: [],
  hideOverlay: true,
  swapLayout: false,
  disableVideo: false,
  audioModalIsOpen: false,
};


export default class Media extends Component {
  constructor(props) {
    super(props);
    this.refContainer = React.createRef();
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
      webcamDraggableState,
    } = this.props;

    const { placement } = webcamDraggableState;
    const placementStorage = Storage.getItem('webcamPlacement');
    const webcamPlacement = placement || placementStorage;

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: (webcamPlacement === 'floating'),
    });

    const containerClassName = cx({
      [styles.container]: true,
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
            maxHeight: usersVideo.length > 0
            && (
              webcamPlacement !== 'left'
              || webcamPlacement !== 'right'
            )
            && (
              webcamPlacement === 'top'
              || webcamPlacement === 'bottom'
            )
              ? '80%'
              : '100%',
            minHeight: BROWSER_ISMOBILE && window.innerWidth > window.innerHeight ? '50%' : '20%',
            maxWidth: usersVideo.length > 0
            && (
              webcamPlacement !== 'top'
              || webcamPlacement !== 'bottom'
            )
            && (
              webcamPlacement === 'left'
              || webcamPlacement === 'right'
            )
              ? '80%'
              : '100%',
            minWidth: '20%',
          }}
        >
          {children}
        </div>
        {
          usersVideo.length > 0
            ? (
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
            )
            : null
        }
      </div>
    );
  }
}

Media.propTypes = propTypes;
Media.defaultProps = defaultProps;
