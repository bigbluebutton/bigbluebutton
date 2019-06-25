import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import _ from 'lodash';
import browser from 'browser-detect';

import Draggable from 'react-draggable';

import { styles } from '../styles.scss';

const propTypes = {
  floatingOverlay: PropTypes.bool,
  hideOverlay: PropTypes.bool,
};

const defaultProps = {
  floatingOverlay: false,
  hideOverlay: true,
};

const fullscreenChangedEvents = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

const BROWSER_ISMOBILE = browser().mobile;

export default class WebcamDraggableOverlay extends Component {
  static getWebcamGridBySelector() {
    return document.querySelector('div[class*="videoList"]');
  }

  static getVideoCountBySelector() {
    return document.querySelectorAll('video[class*="media"]').length;
  }

  static getOverlayBySelector() {
    return document.querySelector('div[class*="overlay"]');
  }

  static getGridLineNum(numCams, camWidth, containerWidth) {
    let used = (camWidth + 10) * numCams;
    let countLines = 0;

    while (used > containerWidth) {
      used -= containerWidth;
      countLines += 1;
    }

    return countLines + 1;
  }

  static waitFor(condition, callback) {
    const cond = condition();
    if (!cond) {
      setTimeout(WebcamDraggableOverlay.waitFor.bind(null, condition, callback), 500);
    } else {
      callback();
    }
    return false;
  }

  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      showDropZones: false,
      showBgDropZoneTop: false,
      showBgDropZoneBottom: false,
      dropOnTop: true,
      dropOnBottom: false,
      initialPosition: {
        x: 0,
        y: 0,
      },
      initialRectPosition: {
        x: 0,
        y: 0,
      },
      lastPosition: {
        x: 0,
        y: 0,
      },
      resetPosition: false,
      isFullScreen: false,
      isVideoLoaded: false,
      isMinWidth: false,
    };

    this.shouldUpdatePosition = true;

    this.updateWebcamPositionByResize = this.updateWebcamPositionByResize.bind(this);
    this.eventVideoFocusChangeListener = this.eventVideoFocusChangeListener.bind(this);

    this.eventResizeListener = _.throttle(
      this.updateWebcamPositionByResize,
      500,
      {
        leading: true,
        trailing: true,
      },
    );

    this.videoMounted = this.videoMounted.bind(this);

    this.handleWebcamDragStart = this.handleWebcamDragStart.bind(this);
    this.handleWebcamDragStop = this.handleWebcamDragStop.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.fullscreenButtonChange = this.fullscreenButtonChange.bind(this);

    this.setIsFullScreen = this.setIsFullScreen.bind(this);
    this.setResetPosition = this.setResetPosition.bind(this);
    this.setInitialReferencePoint = this.setInitialReferencePoint.bind(this);
    this.setLastPosition = this.setLastPosition.bind(this);
    this.setLastWebcamPosition = this.setLastWebcamPosition.bind(this);
    this.setisMinWidth = this.setisMinWidth.bind(this);
    this.setDropOnTop = this.setDropOnTop.bind(this);

    this.dropZoneTopEnterHandler = this.dropZoneTopEnterHandler.bind(this);
    this.dropZoneTopLeaveHandler = this.dropZoneTopLeaveHandler.bind(this);

    this.dropZoneBottomEnterHandler = this.dropZoneBottomEnterHandler.bind(this);
    this.dropZoneBottomLeaveHandler = this.dropZoneBottomLeaveHandler.bind(this);

    this.dropZoneTopMouseUpHandler = this.dropZoneTopMouseUpHandler.bind(this);
    this.dropZoneBottomMouseUpHandler = this.dropZoneBottomMouseUpHandler.bind(this);
  }

  componentDidMount() {
    const { floatingOverlay } = this.props;
    const { resetPosition } = this.state;

    if (!floatingOverlay
      && !resetPosition) {
      this.setResetPosition(true);
    }

    window.addEventListener('resize', this.eventResizeListener);
    window.addEventListener('videoFocusChange', this.eventVideoFocusChangeListener);

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleFullscreenChange);
    });

    // Ensures that the event will be called before the resize
    document.addEventListener('webcamFullscreenButtonChange', this.fullscreenButtonChange);
  }

  componentDidUpdate(prevProps, prevState) {
    const { swapLayout, usersVideo, mediaContainer } = this.props;
    const { lastPosition } = this.state;
    const { y } = lastPosition;
    const userLength = usersVideo.length;
    const prevUserLength = prevProps.usersVideo.length;

    if (prevProps.mediaContainer && mediaContainer) {
      const mediaContainerRect = mediaContainer.getBoundingClientRect();
      const {
        left: mediaLeft,
        top: mediaTop,
      } = mediaContainerRect;
      const prevMediaContainerRect = prevProps.mediaContainer.getBoundingClientRect();
      const {
        left: prevMediaLeft,
        top: prevMediaTop,
      } = prevMediaContainerRect;

      if (mediaLeft !== prevMediaLeft || mediaTop !== prevMediaTop) {
        this.shouldUpdatePosition = false;
      } else if (this.shouldUpdatePosition === false) {
        this.shouldUpdatePosition = true;
      }
    }

    if (prevProps.swapLayout && !swapLayout && userLength === 1) {
      this.shouldUpdatePosition = false;
    }
    if (prevProps.swapLayout && !swapLayout && userLength > 1) {
      this.setLastPosition(0, y);
    }
    if (prevUserLength === 1 && userLength > 1) {
      this.setResetPosition(true);
      this.setDropOnTop(true);
    }
    if (prevUserLength > 1 && userLength === 1) {
      WebcamDraggableOverlay.waitFor(
        () => WebcamDraggableOverlay.getVideoCountBySelector() === 1,
        this.updateWebcamPositionByResize,
      );
    }
  }

  componentWillUnmount() {
    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, this.handleFullscreenChange);
    });

    document.removeEventListener('webcamFullscreenButtonChange', this.fullscreenButtonChange);
    document.removeEventListener('videoFocusChange', this.eventVideoFocusChangeListener);
  }

  setIsFullScreen(isFullScreen) {
    this.setState({ isFullScreen });
  }

  setResetPosition(resetPosition) {
    this.setState({ resetPosition });
  }

  setLastPosition(x, y) {
    this.setState({
      lastPosition: {
        x,
        y,
      },
    });
  }

  setDropOnTop(dropOnTop) {
    this.setState({ dropOnTop });
  }

  setInitialReferencePoint() {
    const { refMediaContainer, usersVideo } = this.props;
    const { current: mediaContainer } = refMediaContainer;
    const userLength = usersVideo.length;

    const webcamBySelector = WebcamDraggableOverlay.getWebcamGridBySelector();

    if (webcamBySelector && mediaContainer && this.shouldUpdatePosition) {
      const webcamBySelectorRect = webcamBySelector.getBoundingClientRect();
      const {
        width: webcamWidth,
        height: webcamHeight,
      } = webcamBySelectorRect;

      const mediaContainerRect = mediaContainer.getBoundingClientRect();
      const {
        width: mediaWidth,
        height: mediaHeight,
      } = mediaContainerRect;

      const lineNum = WebcamDraggableOverlay
        .getGridLineNum(userLength, webcamWidth, mediaWidth);

      const x = mediaWidth - ((webcamWidth + 10) * userLength); // 10 is margin
      const y = mediaHeight - ((webcamHeight + 10) * lineNum); // 10 is margin

      if (x === 0 && y === 0) return false;

      this.setState({
        initialRectPosition: {
          x,
          y,
        },
      });
      return true;
    }
    return false;
  }

  setLastWebcamPosition() {
    const { refMediaContainer, usersVideo, floatingOverlay } = this.props;
    const { current: mediaContainer } = refMediaContainer;
    const { initialRectPosition, dragging } = this.state;
    const userLength = usersVideo.length;

    const { x: initX, y: initY } = initialRectPosition;
    const webcamBySelector = WebcamDraggableOverlay.getWebcamGridBySelector();

    if (webcamBySelector && mediaContainer && this.shouldUpdatePosition) {
      const webcamBySelectorRect = webcamBySelector.getBoundingClientRect();
      const {
        left: webcamLeft,
        top: webcamTop,
      } = webcamBySelectorRect;

      const mediaContainerRect = mediaContainer.getBoundingClientRect();
      const {
        left: mediaLeft,
        top: mediaTop,
      } = mediaContainerRect;

      const webcamXByMedia = webcamLeft - mediaLeft;
      const webcamYByMedia = webcamTop - mediaTop;

      let x = -(initX - webcamXByMedia);
      x = floatingOverlay ? -((initX - webcamXByMedia) + 10) : x;
      x = userLength > 1 ? 0 : x;

      x = !dragging && webcamXByMedia < 0 ? -initX : x;

      let y = -(initY - webcamYByMedia);
      y = webcamYByMedia < 0 ? -initY : y;

      this.setLastPosition(x, y);
    }
  }

  setisMinWidth(isMinWidth) {
    this.setState({ isMinWidth });
  }

  videoMounted() {
    this.setResetPosition(true);
    WebcamDraggableOverlay.waitFor(this.setInitialReferencePoint, this.setLastWebcamPosition);
    this.setState({ isVideoLoaded: true });
  }

  fullscreenButtonChange() {
    this.setIsFullScreen(true);
  }

  updateWebcamPositionByResize() {
    const {
      isVideoLoaded,
      isMinWidth,
    } = this.state;

    if (isVideoLoaded) {
      this.setInitialReferencePoint();
      this.setLastWebcamPosition();
    }

    if (window.innerWidth < 641) {
      this.setisMinWidth(true);
      this.setState({ dropOnTop: true });
      this.setResetPosition(true);
    } else if (isMinWidth) {
      this.setisMinWidth(false);
    }
  }

  eventVideoFocusChangeListener() {
    setTimeout(() => {
      this.setInitialReferencePoint();
      this.setLastWebcamPosition();
    }, 500);
  }

  handleFullscreenChange() {
    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {
      window.removeEventListener('resize', this.eventResizeListener);
      this.setIsFullScreen(true);
    } else {
      this.setIsFullScreen(false);
      window.addEventListener('resize', this.eventResizeListener);
    }
  }

  handleWebcamDragStart(e, position) {
    const { floatingOverlay } = this.props;
    const {
      dragging,
      showDropZones,
      dropOnTop,
      dropOnBottom,
      resetPosition,
    } = this.state;

    if (!floatingOverlay && dropOnTop) WebcamDraggableOverlay.getOverlayBySelector().style.top = 0;

    if (!dragging) this.setState({ dragging: true });
    if (dropOnTop) this.setState({ dropOnTop: false });
    if (dropOnBottom) this.setState({ dropOnBottom: false });
    if (!showDropZones) this.setState({ showDropZones: true });

    if (resetPosition) this.setState({ resetPosition: false });
  }

  handleWebcamDragStop(e, position) {
    const {
      dragging,
      showDropZones,
    } = this.state;

    const { x, y } = position;

    if (dragging) this.setState({ dragging: false });
    if (showDropZones) this.setState({ showDropZones: false });

    this.setLastPosition(x, y);
    window.dispatchEvent(new Event('resize'));
  }

  dropZoneTopEnterHandler() {
    const {
      showBgDropZoneTop,
    } = this.state;

    if (!showBgDropZoneTop) this.setState({ showBgDropZoneTop: true });
  }

  dropZoneBottomEnterHandler() {
    const {
      showBgDropZoneBottom,
    } = this.state;

    if (!showBgDropZoneBottom) this.setState({ showBgDropZoneBottom: true });
  }

  dropZoneTopLeaveHandler() {
    const {
      showBgDropZoneTop,
    } = this.state;

    if (showBgDropZoneTop) this.setState({ showBgDropZoneTop: false });
  }

  dropZoneBottomLeaveHandler() {
    const {
      showBgDropZoneBottom,
    } = this.state;

    if (showBgDropZoneBottom) this.setState({ showBgDropZoneBottom: false });
  }

  dropZoneTopMouseUpHandler() {
    const { dropOnTop } = this.state;
    if (!dropOnTop) {
      this.setState({
        dropOnTop: true,
        dropOnBottom: false,
        resetPosition: true,
      });
    }
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => this.setLastWebcamPosition(), 500);
  }

  dropZoneBottomMouseUpHandler() {
    const { dropOnBottom } = this.state;
    if (!dropOnBottom) {
      this.setState({
        dropOnTop: false,
        dropOnBottom: true,
        resetPosition: true,
      });
    }
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => this.setLastWebcamPosition(), 500);
  }

  render() {
    const {
      swapLayout,
      floatingOverlay,
      hideOverlay,
      disableVideo,
      audioModalIsOpen,
      refMediaContainer,
      usersVideo,
    } = this.props;

    const userLength = usersVideo.length;

    const { current: mediaContainer } = refMediaContainer;

    let mediaContainerRect;
    let mediaHeight;
    if (mediaContainer) {
      mediaContainerRect = mediaContainer.getBoundingClientRect();
      const {
        height,
      } = mediaContainerRect;
      mediaHeight = height;
    }


    const {
      dragging,
      showDropZones,
      showBgDropZoneTop,
      showBgDropZoneBottom,
      dropOnTop,
      dropOnBottom,
      initialPosition,
      lastPosition,
      resetPosition,
      isFullScreen,
      isMinWidth,
    } = this.state;

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.overlayRelative]: (dropOnTop || dropOnBottom),
      [styles.overlayAbsoluteMult]: (!dropOnTop && !dropOnBottom) && userLength > 1,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: floatingOverlay && (!dropOnTop && !dropOnBottom),
      [styles.overlayToTop]: dropOnTop,
      [styles.overlayToBottom]: dropOnBottom,
      [styles.dragging]: dragging,
    });

    const dropZoneTopClassName = cx({
      [styles.dropZoneTop]: true,
      [styles.show]: showDropZones,
      [styles.hide]: !showDropZones,
    });

    const dropZoneBottomClassName = cx({
      [styles.dropZoneBottom]: true,
      [styles.show]: showDropZones,
      [styles.hide]: !showDropZones,
    });

    const dropZoneBgTopClassName = cx({
      [styles.dropZoneBg]: true,
      [styles.top]: true,
      [styles.show]: showBgDropZoneTop,
      [styles.hide]: !showBgDropZoneTop,
    });

    const dropZoneBgBottomClassName = cx({
      [styles.dropZoneBg]: true,
      [styles.bottom]: true,
      [styles.show]: showBgDropZoneBottom,
      [styles.hide]: !showBgDropZoneBottom,
    });

    const cursor = () => {
      if ((!swapLayout || !isFullScreen || !BROWSER_ISMOBILE || !isMinWidth) && !dragging) return 'grab';
      if (dragging) return 'grabbing';
      return 'default';
    };

    return (
      <Fragment>
        <div
          className={dropZoneTopClassName}
          onMouseEnter={this.dropZoneTopEnterHandler}
          onMouseLeave={this.dropZoneTopLeaveHandler}
          onMouseUp={this.dropZoneTopMouseUpHandler}
          role="presentation"
          style={{ height: userLength > 1 ? '50%' : '20%' }}
        />
        <div
          className={dropZoneBgTopClassName}
          style={{ height: userLength > 1 ? '50%' : '20%' }}
        />

        <Draggable
          handle="video"
          bounds="#container"
          onStart={this.handleWebcamDragStart}
          onStop={this.handleWebcamDragStop}
          onMouseDown={e => e.preventDefault()}
          disabled={swapLayout || isFullScreen || BROWSER_ISMOBILE || isMinWidth}
          position={resetPosition || swapLayout ? initialPosition : lastPosition}
        >
          <div
            className={!swapLayout ? overlayClassName : contentClassName}
            style={{
              maxHeight: mediaHeight,
            }}
          >
            {
              !disableVideo && !audioModalIsOpen
                ? (
                  <VideoProviderContainer
                    cursor={cursor()}
                    swapLayout={swapLayout}
                    onMount={this.videoMounted}
                  />
                ) : null}
          </div>
        </Draggable>

        <div
          className={dropZoneBottomClassName}
          onMouseEnter={this.dropZoneBottomEnterHandler}
          onMouseLeave={this.dropZoneBottomLeaveHandler}
          onMouseUp={this.dropZoneBottomMouseUpHandler}
          role="presentation"
          style={{ height: userLength > 1 ? '50%' : '20%' }}
        />
        <div
          className={dropZoneBgBottomClassName}
          style={{ height: userLength > 1 ? '50%' : '20%' }}
        />
      </Fragment>
    );
  }
}

WebcamDraggableOverlay.propTypes = propTypes;
WebcamDraggableOverlay.defaultProps = defaultProps;
