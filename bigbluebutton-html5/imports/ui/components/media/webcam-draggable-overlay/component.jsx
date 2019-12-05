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
  hideOverlay: PropTypes.bool,
  disableVideo: PropTypes.bool,
  audioModalIsOpen: PropTypes.bool,
  webcamDraggableState: PropTypes.objectOf(Object).isRequired,
  webcamDraggableDispatch: PropTypes.func.isRequired,
  refMediaContainer: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

const defaultProps = {
  swapLayout: false,
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
    const { optimalGrid } = webcamDraggableState;
    if (optimalGrid) {
      webcamDraggableDispatch(
        {
          type: 'setVideoListSize',
          value: {
            width: optimalGrid.width,
            height: optimalGrid.height,
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
    const { webcamDraggableState } = this.props;
    const { videoListRef } = webcamDraggableState;
    if (videoListRef) {
      const videoListRefRect = videoListRef.getBoundingClientRect();
      const {
        top, left, width, height,
      } = videoListRefRect;
      return {
        top, // 10 = margin
        left, // 10 = margin
        width, // 20 = margin
        height, // 20 = margin
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

  handleWebcamDragStart() {
    const { webcamDraggableDispatch } = this.props;
    const { x, y } = this.calculatePosition();
    webcamDraggableDispatch({ type: 'dragStart' });
    webcamDraggableDispatch(
      {
        type: 'setTempPosition',
        value: {
          x,
          y,
        },
      },
    );
  }

  handleWebcamDragStop(e) {
    const { webcamDraggableDispatch } = this.props;
    const targetClassname = JSON.stringify(e.target.className);

    if (targetClassname) {
      if (targetClassname.includes('Top')) {
        webcamDraggableDispatch({ type: 'setplacementToTop' });
      } else if (targetClassname.includes('Right')) {
        webcamDraggableDispatch({ type: 'setplacementToRight' });
        // webcamDraggableDispatch(
        //   {
        //     type: 'setLastPosition',
        //     value: {
        //       x: 0,
        //       y: 0,
        //     },
        //   },
        // );
      } else if (targetClassname.includes('Bottom')) {
        webcamDraggableDispatch({ type: 'setplacementToBottom' });
      } else if (targetClassname.includes('Left')) {
        webcamDraggableDispatch({ type: 'setplacementToLeft' });
        // webcamDraggableDispatch(
        //   {
        //     type: 'setLastPosition',
        //     value: {
        //       x: 0,
        //       y: 0,
        //     },
        //   },
        // );
      }
    }
    webcamDraggableDispatch({ type: 'dragEnd' });
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    const {
      webcamDraggableState,
      swapLayout,
      hideOverlay,
      disableVideo,
      audioModalIsOpen,
      refMediaContainer,
    } = this.props;

    const {
      dragging,
      isCameraFullscreen,
      videoListSize,
      videoRef,
      optimalGrid,
    } = webcamDraggableState;
    let placement = Storage.getItem('webcamPlacement');
    const lastPosition = Storage.getItem('webcamLastPosition') || { x: 0, y: 0 };
    let position = lastPosition;
    if (!placement) {
      placement = webcamsDefaultPlacement;
    }

    let videoRefWidth;
    if (videoRef) {
      const videoRefRect = videoRef.getBoundingClientRect();
      const {
        width: vWidth,
      } = videoRefRect;
      videoRefWidth = vWidth;
    }

    if (dragging) {
      position = webcamDraggableState.tempPosition;
    } else if (!dragging) {
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
        && !dragging && !swapLayout ? mediaWidth - webcamsWidth : position.x,
      y: isOverflowHeight
        && !dragging && !swapLayout ? mediaHeight - (webcamsHeight + 1) : position.y,
    };

    const contentClassName = cx({
      [styles.content]: true,
      [styles.fullWidth]: swapLayout,
      [styles.fullHeight]: swapLayout,
    });

    const { current: mediaContainer } = refMediaContainer;
    let layout = 'vertical';
    if (mediaContainer) {
      const classNameMediaContainer = mediaContainer.className;
      if (classNameMediaContainer.includes('containerH')) {
        layout = 'horizontal';
      } else {
        layout = 'vertical';
      }
    }

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: dragging,
      [styles.autoWidth]: dragging,
      [styles.fullWidth]: (
        (
          placement === 'top'
          || placement === 'bottom'
        )
        || swapLayout
      )
        && !dragging,
      [styles.fullHeight]: (
        (
          placement === 'left'
          && placement === 'right'
        )
        || swapLayout
      )
        && !dragging,
      [styles.overlayToTop]: placement === 'top' && !dragging,
      [styles.overlayToRight]: placement === 'right' && !dragging,
      [styles.overlayToBottom]: placement === 'bottom' && !dragging,
      [styles.overlayToLeft]: placement === 'left' && !dragging,
      [styles.dragging]: dragging,
      [styles.hide]: (
        (
          placement === 'left'
          || placement === 'right'
        )
        && layout === 'vertical'
      )
        || (
          (
            placement === 'top'
            || placement === 'bottom'
          )
          && layout === 'horizontal'
        ),
    });

    const dropZoneTopClassName = cx({
      [styles.dropZoneTop]: true,
      [styles.show]: dragging,
      [styles.hide]: !dragging,
      [styles.cursorGrabbing]: dragging && !isCameraFullscreen,
    });

    const dropZoneLeftClassName = cx({
      [styles.dropZoneLeft]: true,
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

    const dropZoneRightClassName = cx({
      [styles.dropZoneRight]: true,
      [styles.show]: dragging,
      [styles.hide]: !dragging,
      [styles.cursorGrabbing]: dragging && !isCameraFullscreen,
    });

    const dropZoneBgTopClassName = cx({
      [styles.dropZoneBgTop]: true,
    });

    const dropZoneBgLeftClassName = cx({
      [styles.dropZoneBgLeft]: true,
    });

    const dropZoneBgBottomClassName = cx({
      [styles.dropZoneBgBottom]: true,
    });

    const dropZoneBgRightClassName = cx({
      [styles.dropZoneBgRight]: true,
    });

    let resizeWidth;
    let resizeHeight;
    if ((placement === 'top' || placement === 'bottom') && !dragging) {
      resizeWidth = '100%';
      resizeHeight = videoListSize.height;
    }
    if ((placement === 'left' || placement === 'right') && !dragging) {
      resizeWidth = videoRefWidth;
      resizeHeight = '100%';
    }
    if (dragging) {
      resizeHeight = optimalGrid.height;
      resizeWidth = optimalGrid.width;
    }
    return (
      <Fragment>
        <div
          className={dropZoneTopClassName}
          style={{ height: '15vh' }}
        >
          <div
            className={dropZoneBgTopClassName}
          />
        </div>
        <div
          className={dropZoneLeftClassName}
          style={{
            width: '15vh',
            height: `calc(${mediaHeight}px - (15vh * 2))`,
          }}
        >
          <div
            className={dropZoneBgLeftClassName}
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
              {
                height: resizeHeight,
                width: resizeWidth,
              }
            }
            lockAspectRatio
            handleWrapperClass="resizeWrapper"
            onResize={dispatchResizeEvent}
            onResizeStop={this.onResizeStop}
            enable={{
              top: (placement === 'bottom') && !swapLayout,
              bottom: (placement === 'top') && !swapLayout,
              left: (placement === 'right') && !swapLayout,
              right: (placement === 'left') && !swapLayout,
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
              marginLeft: 0,
              marginRight: 0,
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
          style={{ height: '15vh' }}
        >
          <div
            className={dropZoneBgBottomClassName}
          />
        </div>
        <div
          className={dropZoneRightClassName}
          style={{
            width: '15vh',
            height: `calc(${mediaHeight}px - (15vh * 2))`,
          }}
        >
          <div
            className={dropZoneBgRightClassName}
          />
        </div>
      </Fragment>
    );
  }
}

WebcamDraggable.propTypes = propTypes;
WebcamDraggable.defaultProps = defaultProps;

export default withDraggableContext(WebcamDraggable);
