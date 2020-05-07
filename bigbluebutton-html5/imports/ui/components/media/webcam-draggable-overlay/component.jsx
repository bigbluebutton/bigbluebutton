import React, { PureComponent, Fragment } from 'react';
import Draggable from 'react-draggable';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';
import { isMobile, isIPad13 } from 'react-device-detect';
import { withDraggableConsumer } from './context';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import { styles } from '../styles.scss';
import Storage from '../../../services/storage/session';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';
import { WEBCAMSAREA_MIN_PERCENT } from '/imports/ui/components/layout/layout-manager';

const BROWSER_ISMOBILE = isMobile || isIPad13;

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

class WebcamDraggable extends PureComponent {
  constructor(props) {
    super(props);

    const { layoutContextState } = props;
    const { webcamsPlacement, mediaBounds } = layoutContextState;
    this.state = {
      webcamsAreaResizable: {
        width: webcamsPlacement === 'top' || webcamsPlacement === 'bottom' ? mediaBounds.width : mediaBounds.width * WEBCAMSAREA_MIN_PERCENT,
        height: webcamsPlacement === 'left' || webcamsPlacement === 'right' ? mediaBounds.height : mediaBounds.height * WEBCAMSAREA_MIN_PERCENT,
      },
      resizing: false,
    };

    this.handleWebcamDragStart = this.handleWebcamDragStart.bind(this);
    this.handleWebcamDragStop = this.handleWebcamDragStop.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
    this.onResizeStart = this.onResizeStart.bind(this);
  }

  componentDidMount() {
    const { webcamDraggableState } = this.props;
    const {
      lastPlacementLandscape,
      lastPlacementPortrait,
    } = webcamDraggableState;
    const { layoutContextState, layoutContextDispatch } = this.props;
    const { presentationOrientation } = layoutContextState;
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    window.addEventListener('orientationchange', () => setTimeout(this.recalculateAreaSize, 500));

    if (presentationOrientation === 'landscape') {
      layoutContextDispatch({
        type: 'setWebcamsPlacement',
        value: !lastPlacementLandscape ? 'top' : lastPlacementLandscape,
      });
    }
    if (presentationOrientation === 'portrait') {
      layoutContextDispatch({
        type: 'setWebcamsPlacement',
        value: !lastPlacementPortrait ? 'left' : lastPlacementPortrait,
      });
    }
  }

  componentDidUpdate(prevProps) {
    // const { swapLayout } = this.props;

    // Webcam Draggable Context
    const { webcamDraggableState } = this.props;
    const {
      lastPlacementLandscape,
      lastPlacementPortrait,
    } = webcamDraggableState;

    // Layout Context
    const { layoutContextState, layoutContextDispatch } = this.props;
    const { layoutContextState: prevLayoutContextState } = prevProps;
    const {
      webcamsAreaSize,
      presentationOrientation,
    } = layoutContextState;
    const {
      webcamsAreaSize: prevWebcamsAreaSize,
      presentationOrientation: prevPresentationOrientation,
    } = prevLayoutContextState;


    if (webcamsAreaSize.width !== prevWebcamsAreaSize.width
      || webcamsAreaSize.height !== prevWebcamsAreaSize.height) {
      this.setWebcamsAreaResizable(webcamsAreaSize.width, webcamsAreaSize.height);
    }

    if (prevPresentationOrientation !== presentationOrientation) {
      const storagePlacement = Storage.getItem('webcamsPlacement');
      if ((prevPresentationOrientation == null || prevPresentationOrientation === 'portrait') && presentationOrientation === 'landscape') {
        if (storagePlacement !== lastPlacementLandscape && lastPlacementLandscape === 'top') {
          layoutContextDispatch({
            type: 'setWebcamsPlacement',
            value: 'top',
          });
        }
        if (storagePlacement !== lastPlacementLandscape && lastPlacementLandscape === 'bottom') {
          layoutContextDispatch({
            type: 'setWebcamsPlacement',
            value: 'bottom',
          });
        }
      }
      if ((prevPresentationOrientation == null || prevPresentationOrientation === 'landscape') && presentationOrientation === 'portrait') {
        if (storagePlacement !== lastPlacementPortrait && lastPlacementPortrait === 'left') {
          layoutContextDispatch({
            type: 'setWebcamsPlacement',
            value: 'left',
          });
        }
        if (storagePlacement !== lastPlacementPortrait && lastPlacementPortrait === 'right') {
          layoutContextDispatch({
            type: 'setWebcamsPlacement',
            value: 'right',
          });
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedOnResize);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  onFullscreenChange() {
    this.forceUpdate();
  }

  onResizeStart() {
    this.setState({ resizing: true });
  }

  onResizeStop(resizableWidth, resizableHeight) {
    const { webcamsAreaResizable } = this.state;
    const { layoutContextState, layoutContextDispatch } = this.props;
    const { webcamsPlacement, webcamsAreaSize } = layoutContextState;

    layoutContextDispatch(
      {
        type: 'setAutoArrangeLayout',
        value: false,
      },
    );

    const newWebcamsAreaResizable = {
      width: Math.trunc(webcamsAreaResizable.width) + resizableWidth,
      height: Math.trunc(webcamsAreaResizable.height) + resizableHeight,
    };

    console.log('>>  newWebcamsAreaResizable', newWebcamsAreaResizable);


    if (webcamsPlacement === 'top' || webcamsPlacement === 'bottom') {
      layoutContextDispatch(
        {
          type: 'setWebcamsAreaUserSetsHeight',
          value: newWebcamsAreaResizable.height,
        },
      );
    }

    if (webcamsPlacement === 'right' || webcamsPlacement === 'left') {
      layoutContextDispatch(
        {
          type: 'setWebcamsAreaUserSetsWidth',
          value: newWebcamsAreaResizable.width,
        },
      );
    }


    layoutContextDispatch(
      {
        type: 'setWebcamsAreaSize',
        value: {
          width: webcamsPlacement === 'top' || webcamsPlacement === 'bottom' ? webcamsAreaSize.width : newWebcamsAreaResizable.width,
          height: webcamsPlacement === 'left' || webcamsPlacement === 'right' ? webcamsAreaSize.height : newWebcamsAreaResizable.height,
        },
      },
    );

    this.setState({
      webcamsAreaResizable: {
        width: webcamsPlacement === 'top' || webcamsPlacement === 'bottom' ? webcamsAreaSize.width : newWebcamsAreaResizable.width,
        height: webcamsPlacement === 'left' || webcamsPlacement === 'right' ? webcamsAreaSize.height : newWebcamsAreaResizable.height,
      },
    });

    setTimeout(() => this.setState({ resizing: false }), 500);
    window.dispatchEvent(new Event('webcamAreaResize'));
  }

  setWebcamsAreaResizable(width, height) {
    this.setState({
      webcamsAreaResizable: { width, height },
    });
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
        top,
        left,
        width,
        height,
      };
    }
    return false;
  }

  calculatePosition() {
    const { layoutContextState } = this.props;
    const { mediaBounds } = layoutContextState;

    const { top: mediaTop, left: mediaLeft } = mediaBounds;
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
    const { webcamDraggableDispatch, layoutContextDispatch } = this.props;
    const targetClassname = JSON.stringify(e.target.className);

    if (targetClassname) {
      if (targetClassname.includes('Top')) {
        layoutContextDispatch({
          type: 'setWebcamsPlacement',
          value: 'top',
        });
      } else if (targetClassname.includes('Right')) {
        layoutContextDispatch({
          type: 'setWebcamsPlacement',
          value: 'right',
        });
      } else if (targetClassname.includes('Bottom')) {
        layoutContextDispatch({
          type: 'setWebcamsPlacement',
          value: 'bottom',
        });
      } else if (targetClassname.includes('Left')) {
        layoutContextDispatch({
          type: 'setWebcamsPlacement',
          value: 'left',
        });
      }
    }
    webcamDraggableDispatch({ type: 'dragEnd' });
    window.dispatchEvent(new Event('webcamAreaResize'));
  }

  render() {
    const {
      layoutContextState,
      webcamDraggableState,
      swapLayout,
      hideOverlay,
      disableVideo,
      audioModalIsOpen,
    } = this.props;

    const { resizing, webcamsAreaResizable } = this.state;

    const { mediaBounds } = layoutContextState;

    const {
      dragging,
      isCameraFullscreen,
      optimalGrid,
    } = webcamDraggableState;

    const webcamsPlacement = Storage.getItem('webcamsPlacement');

    const lastPosition = Storage.getItem('webcamLastPosition') || { x: 0, y: 0 };

    let position = lastPosition;

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
    } = mediaBounds;

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

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: dragging,
      [styles.autoWidth]: dragging,
      [styles.overlayToTop]: webcamsPlacement === 'top' && !dragging,
      [styles.overlayToRight]: webcamsPlacement === 'right' && !dragging,
      [styles.overlayToBottom]: webcamsPlacement === 'bottom' && !dragging,
      [styles.overlayToLeft]: webcamsPlacement === 'left' && !dragging,
      [styles.dragging]: dragging,
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

    // let resizeWidth;
    // let resizeHeight;
    // if (resizing && (webcamsPlacement === 'top' || webcamsPlacement === 'bottom') && !dragging) {
    //   resizeWidth = '100%';
    //   resizeHeight = videoListSize.height;
    // }
    // if (!resizing && (webcamsPlacement === 'top'
    // || webcamsPlacement === 'bottom') && !dragging) {
    //   resizeWidth = '100%';
    //   resizeHeight = webcamsAreaSize.height;
    // }

    // if (resizing && (webcamsPlacement === 'left' || webcamsPlacement === 'right') && !dragging) {
    //   resizeWidth = videoListSize.width;
    //   resizeHeight = '100%';
    // }
    // if (!resizing && (webcamsPlacement === 'left'
    // || webcamsPlacement === 'right') && !dragging) {
    //   resizeWidth = webcamsAreaSize.width;
    //   resizeHeight = '100%';
    // }

    // if (dragging) {
    //   resizeHeight = optimalGrid.height;
    //   resizeWidth = optimalGrid.width;
    // }

    // console.log('webcamsAreaResizable.height', webcamsAreaResizable.height);


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
          disabled={swapLayout || isCameraFullscreen || BROWSER_ISMOBILE || resizing}
          position={position}
        >
          <Resizable
            minWidth={mediaBounds.width * WEBCAMSAREA_MIN_PERCENT}
            minHeight={mediaBounds.height * WEBCAMSAREA_MIN_PERCENT}
            size={
              {
                height: dragging ? optimalGrid.height : webcamsAreaResizable.height,
                width: dragging ? optimalGrid.width : webcamsAreaResizable.width,
              }
            }
            lockAspectRatio
            handleWrapperClass="resizeWrapper"
            onResizeStart={this.onResizeStart}
            onResizeStop={(e, direction, ref, d) => {
              this.onResizeStop(d.width, d.height);
            }}
            enable={{
              top: (webcamsPlacement === 'bottom') && !swapLayout,
              bottom: (webcamsPlacement === 'top') && !swapLayout,
              left: (webcamsPlacement === 'right') && !swapLayout,
              right: (webcamsPlacement === 'left') && !swapLayout,
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

export default withDraggableConsumer(withLayoutConsumer(WebcamDraggable));
