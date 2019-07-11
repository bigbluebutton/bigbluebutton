import React, { Component, Fragment } from 'react';
import Draggable from 'react-draggable';
import cx from 'classnames';
import _ from 'lodash';
import browser from 'browser-detect';
import { withDraggableContext } from './context';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import { styles } from '../styles.scss';
import Storage from '../../../services/storage/session';

const { webcamsDefaultPlacement } = Meteor.settings.public.layout;
const BROWSER_ISMOBILE = browser().mobile;

class WebcamDraggable extends Component {
  constructor(props) {
    super(props);

    this.handleWebcamDragStart = this.handleWebcamDragStart.bind(this);
    this.handleWebcamDragStop = this.handleWebcamDragStop.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', _.debounce(this.onResize.bind(this), 500));
  }

  componentDidUpdate(prevProps) {
    const { swapLayout } = this.props;
    if (prevProps.swapLayout === true && swapLayout === false) {
      setTimeout(() => this.forceUpdate(), 500);
    }
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
    }
  }

  getMediaBounds() {
    const { refMediaContainer, webcamDraggableState, webcamDraggableDispatch } = this.props;
    const { mediaSize: mediaState } = webcamDraggableState;
    const { current: mediaContainer } = refMediaContainer;
    if (mediaContainer) {
      const mediaContainerRect = mediaContainer.getBoundingClientRect();
      const {
        top, left, width, height,
      } = mediaContainerRect;

      if (mediaState.width === 0 || mediaState.height === 0) {
        webcamDraggableDispatch(
          {
            type: 'setMediaSize',
            value: {
              width,
              height,
            },
          },
        );
      }

      return {
        top,
        left,
        width,
        height,
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
    const targetClassname = e.target.className;
    const { x, y } = position;

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

    const { dragging, isFullscreen } = webcamDraggableState;
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

    if (swapLayout || isFullscreen || BROWSER_ISMOBILE) {
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
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: (singleWebcam && placement === 'floating') || dragging,
      [styles.fit]: singleWebcam && (placement === 'floating' || dragging),
      [styles.full]: (singleWebcam && (placement === 'top' || placement === 'bottom')
        && !dragging)
        || !singleWebcam,
      [styles.overlayToTop]: (placement === 'floating' && !singleWebcam)
        || (placement === 'top' && !dragging),
      [styles.overlayToBottom]: placement === 'bottom' && !dragging,
      [styles.dragging]: dragging,
    });

    const dropZoneTopClassName = cx({
      [styles.dropZoneTop]: true,
      [styles.show]: dragging,
      [styles.hide]: !dragging,
      [styles.cursorGrabbing]: dragging,
    });

    const dropZoneBottomClassName = cx({
      [styles.dropZoneBottom]: true,
      [styles.show]: dragging,
      [styles.hide]: !dragging,
      [styles.cursorGrabbing]: dragging,
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
          disabled={swapLayout || isFullscreen || BROWSER_ISMOBILE}
          position={position}
        >
          <div
            className={!swapLayout ? overlayClassName : contentClassName}
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
            {!disableVideo && !audioModalIsOpen ? (
              <VideoProviderContainer
                swapLayout={swapLayout}
              />
            ) : null}
          </div>
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

export default withDraggableContext(WebcamDraggable);
