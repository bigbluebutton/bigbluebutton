import React, { Component, Fragment } from 'react';
import Draggable from 'react-draggable';
import cx from 'classnames';
import _ from 'lodash';
import browser from 'browser-detect';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';
import { withDraggableContext } from './context';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import { styles } from '../styles.scss';
import Storage from '../../../services/storage/session';

const { webcamsDefaultPlacement } = Meteor.settings.public.layout;
const BROWSER_ISMOBILE = browser().mobile;

const propTypes = {
  swapLayout: PropTypes.bool,
  singleWebcam: PropTypes.bool,
  hideOverlay: PropTypes.bool,
  disableVideo: PropTypes.bool,
  audioModalIsOpen: PropTypes.bool,
  webcamDraggableState: PropTypes.objectOf(Object).isRequired,
  webcamDraggableDispatch: PropTypes.func.isRequired,
  refMediaContainer: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

const defaultProps = {
  swapLayout: false,
  singleWebcam: true,
  hideOverlay: false,
  disableVideo: false,
  audioModalIsOpen: false,
  refMediaContainer: null,
};
const dispatchResizeEvent = () => window.dispatchEvent(new Event('resize'));

class WebcamDraggable extends Component {
  constructor(props) {
    super(props);

    this.handleWebcamDragStart = this.handleWebcamDragStart.bind(this);
    this.handleWebcamDragStop = this.handleWebcamDragStop.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.debouncedOnResize = _.debounce(this.onResize.bind(this), 500);
    this.onResizeStop = this.onResizeStop.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.debouncedOnResize);
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  componentDidUpdate(prevProps) {
    const { swapLayout, webcamDraggableState } = this.props;
    const { placement } = webcamDraggableState;
    const { webcamDraggableState: prevWebcamDraggableState } = prevProps;
    const { placement: prevPlacement } = prevWebcamDraggableState;
    if (prevProps.swapLayout !== swapLayout) {
      setTimeout(() => this.forceUpdate(), 500);
    }

    if (prevPlacement !== placement) {
      setTimeout(() => this.forceUpdate(), 200);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedOnResize);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  onFullscreenChange() {
    this.forceUpdate();
  }

  onResize() {
    const { webcamDraggableState, webcamDraggableDispatch } = this.props;
    const { mediaSize } = webcamDraggableState;
    const { width: stateWidth, height: stateHeight } = mediaSize;
    const { width, height } = this.getMediaBounds();

    if (stateWidth !== width || stateHeight !== height) {
      webcamDraggableDispatch(
        {
          type: 'setMediaSize',
          value: {
            width,
            height,
          },
        },
      );
      this.onResizeStop();
    }
  }

  onResizeStop() {
    const { webcamDraggableState, webcamDraggableDispatch } = this.props;
    const { videoListRef } = webcamDraggableState;
    if (videoListRef) {
      const videoListRefRect = videoListRef.getBoundingClientRect();
      const {
        width, height,
      } = videoListRefRect;
      webcamDraggableDispatch(
        {
          type: 'setVideoListSize',
          value: {
            width,
            height,
          },
        },
      );
    }
    window.dispatchEvent(new Event('resize'));
  }

  getMediaBounds() {
    const { refMediaContainer, webcamDraggableState, webcamDraggableDispatch } = this.props;
    const { mediaSize: mediaState } = webcamDraggableState;
    const { current: mediaContainer } = refMediaContainer;
    if (mediaContainer) {
      const mediaContainerRect = mediaContainer.getBoundingClientRect();
      const {
        top, left, width: newWidth, height: newHeight,
      } = mediaContainerRect;

      if ((mediaState.width === 0 || mediaState.height === 0) && (newWidth > 0 && newHeight > 0)) {
        webcamDraggableDispatch(
          {
            type: 'setMediaSize',
            value: {
              newWidth,
              newHeight,
            },
          },
        );
      }

      return {
        top,
        left,
        width: newWidth,
        height: newHeight,
      };
    }
    return false;
  }

  getWebcamsListBounds() {
    const { webcamDraggableState, singleWebcam } = this.props;
    const { videoListRef } = webcamDraggableState;
    if (videoListRef) {
      const videoListRefRect = videoListRef.getBoundingClientRect();
      const {
        top, left, width, height,
      } = videoListRefRect;
      return {
        top: top - 10, // 10 = margin
        left: left - (singleWebcam ? 10 : 0), // 10 = margin
        width: width + (singleWebcam ? 20 : 0), // 20 = margin
        height: height + 20, // 20 = margin
      };
    }
    return false;
  }

  calculatePosition() {
    const { top: mediaTop, left: mediaLeft } = this.getMediaBounds();
    const { top: webcamsListTop, left: webcamsListLeft } = this.getWebcamsListBounds();
    const x = webcamsListLeft - mediaLeft;
    const y = webcamsListTop - mediaTop;
    return {
      x,
      y,
    };
  }

  async handleWebcamDragStart() {
    const { webcamDraggableDispatch, singleWebcam } = this.props;
    const { x, y } = await this.calculatePosition();

    webcamDraggableDispatch({ type: 'dragStart' });

    webcamDraggableDispatch(
      {
        type: 'setTempPosition',
        value: {
          x: singleWebcam ? x : 0,
          y,
        },
      },
    );
  }

  handleWebcamDragStop(e, position) {
    const { webcamDraggableDispatch, singleWebcam } = this.props;
    const targetClassname = JSON.stringify(e.target.className);
    const { x, y } = position;

    if (targetClassname) {
      if (targetClassname.includes('Top')) {
        webcamDraggableDispatch({ type: 'setplacementToTop' });
      } else if (targetClassname.includes('Bottom')) {
        webcamDraggableDispatch({ type: 'setplacementToBottom' });
      } else if (singleWebcam) {
        webcamDraggableDispatch(
          {
            type: 'setLastPosition',
            value: {
              x,
              y,
            },
          },
        );
        webcamDraggableDispatch({ type: 'setplacementToFloating' });
      }
    }
    webcamDraggableDispatch({ type: 'dragEnd' });
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    const {
      webcamDraggableState,
      singleWebcam,
      swapLayout,
      hideOverlay,
      disableVideo,
      audioModalIsOpen,
    } = this.props;

    const { dragging, isCameraFullscreen, videoListSize } = webcamDraggableState;
    let placement = Storage.getItem('webcamPlacement');
    const lastPosition = Storage.getItem('webcamLastPosition') || { x: 0, y: 0 };
    let position = lastPosition;
    if (!placement) {
      placement = webcamsDefaultPlacement;
    }

    if (dragging) {
      position = webcamDraggableState.tempPosition;
    } else if (!dragging && placement === 'floating' && singleWebcam) {
      position = webcamDraggableState.lastPosition;
    } else {
      position = {
        x: 0,
        y: 0,
      };
    }

    if (swapLayout || isCameraFullscreen || BROWSER_ISMOBILE) {
      position = {
        x: 0,
        y: 0,
      };
    }

    const {
      width: mediaWidth,
      height: mediaHeight,
    } = this.getMediaBounds();

    const {
      width: webcamsWidth,
      height: webcamsHeight,
    } = this.getWebcamsListBounds();

    const isOverflowWidth = (lastPosition.x + webcamsWidth) > mediaWidth;
    const isOverflowHeight = (lastPosition.y + webcamsHeight) > mediaHeight;

    position = {
      x: isOverflowWidth
        && !dragging && !swapLayout && singleWebcam && placement === 'floating' ? mediaWidth - webcamsWidth : position.x,
      y: isOverflowHeight
        && !dragging && !swapLayout && singleWebcam && placement === 'floating' ? mediaHeight - (webcamsHeight + 1) : position.y,
    };

    const contentClassName = cx({
      [styles.content]: true,
      [styles.fullWidth]: !singleWebcam || swapLayout,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: (singleWebcam && placement === 'floating') || dragging,
      [styles.autoWidth]: singleWebcam,
      [styles.fullWidth]: (singleWebcam
        && (placement === 'top' || placement === 'bottom')
        && !dragging)
        || !singleWebcam
        || swapLayout,
      [styles.overlayToTop]: (placement === 'floating' && !singleWebcam)
        || (placement === 'top' && !dragging),
      [styles.overlayToBottom]: placement === 'bottom' && !dragging,
      [styles.dragging]: dragging,
    });

    const dropZoneTopClassName = cx({
      [styles.dropZoneTop]: true,
      [styles.show]: dragging,
      [styles.hide]: !dragging,
      [styles.cursorGrabbing]: dragging && !isCameraFullscreen,
    });

    const dropZoneBottomClassName = cx({
      [styles.dropZoneBottom]: true,
      [styles.show]: dragging,
      [styles.hide]: !dragging,
      [styles.cursorGrabbing]: dragging && !isCameraFullscreen,
    });

    const dropZoneBgTopClassName = cx({
      [styles.dropZoneBgTop]: true,
    });

    const dropZoneBgBottomClassName = cx({
      [styles.dropZoneBgBottom]: true,
    });

    return (
      <Fragment>
        <div
          className={dropZoneTopClassName}
          style={{ height: !singleWebcam ? '50%' : '20%' }}
        >
          <div
            className={dropZoneBgTopClassName}
          />
        </div>

        <Draggable
          handle="video"
          bounds="#container"
          onStart={this.handleWebcamDragStart}
          onStop={this.handleWebcamDragStop}
          onMouseDown={e => e.preventDefault()}
          disabled={swapLayout || isCameraFullscreen || BROWSER_ISMOBILE}
          position={position}
        >
          <Resizable
            size={
              singleWebcam
                ? {
                  height: videoListSize.height,
                  width: videoListSize.width,
                }
                : {
                  height: videoListSize.height,
                }
            }
            lockAspectRatio
            handleWrapperClass="resizeWrapper"
            onResize={dispatchResizeEvent}
            onResizeStop={this.onResizeStop}
            enable={{
              top: !(placement === 'top') && !swapLayout,
              bottom: !(placement === 'bottom') && !swapLayout,
              left: false,
              right: false,
              topLeft: false,
              topRight: false,
              bottomLeft: false,
              bottomRight: false,
            }}
            className={
              !swapLayout
                ? overlayClassName
                : contentClassName}
            style={{
              marginLeft: singleWebcam
                && !(placement === 'bottom' || placement === 'top')
                ? 10
                : 0,
              marginRight: singleWebcam
                && !(placement === 'bottom' || placement === 'top')
                ? 10
                : 0,
            }}
          >
            {
              !disableVideo
                && !audioModalIsOpen
                ? (
                  <VideoProviderContainer
                    swapLayout={swapLayout}
                  />
                )
                : null
            }
          </Resizable>
        </Draggable>

        <div
          className={dropZoneBottomClassName}
          style={{ height: !singleWebcam ? '50%' : '20%' }}
        >
          <div
            className={dropZoneBgBottomClassName}
          />
        </div>
      </Fragment>
    );
  }
}

WebcamDraggable.propTypes = propTypes;
WebcamDraggable.defaultProps = defaultProps;

export default withDraggableContext(WebcamDraggable);
