import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';
import _ from 'lodash';
import browser from 'browser-detect';

import Draggable from 'react-draggable';

import { styles } from '../styles';

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
  static getWebcamBySelector() {
    return document.querySelector('video[class^="media"]');
  }

  static getWebcamBySelectorCount() {
    return document.querySelectorAll('video[class^="media"]').length;
  }

  static getWebcamListBySelector() {
    return document.querySelector('div[class^="videoList"]');
  }

  static getVideoCanvasBySelector() {
    return document.querySelector('div[class^="videoCanvas"]');
  }

  static getOverlayBySelector() {
    return document.querySelector('div[class*="overlay"]');
  }

  static isOverlayAbsolute() {
    return !!(document.querySelector('div[class*="overlayAbsolute"]'));
  }

  static getIsOverlayChanged() {
    const overlayToTop = document.querySelector('div[class*="overlayToTop"]');
    const overlayToBottom = document.querySelector('div[class*="overlayToBottom"]');

    return !!(overlayToTop || overlayToBottom);
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
      dropOnTop: BROWSER_ISMOBILE,
      dropOnBottom: !BROWSER_ISMOBILE,
      initialPosition: { x: 0, y: 0 },
      initialRectPosition: { x: 0, y: 0 },
      lastPosition: { x: 0, y: 0 },
      resetPosition: false,
      isFullScreen: false,
      isVideoLoaded: false,
      isMinWidth: false,
      userLength: 0,
      shouldUpdatePosition: true,
    };

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

    this.getVideoListUsersChange = this.getVideoListUsersChange.bind(this);
    this.setIsFullScreen = this.setIsFullScreen.bind(this);
    this.setResetPosition = this.setResetPosition.bind(this);
    this.setInitialReferencePoint = this.setInitialReferencePoint.bind(this);
    this.setLastPosition = this.setLastPosition.bind(this);
    this.setShouldUpdatePosition = this.setShouldUpdatePosition.bind(this);
    this.setLastWebcamPosition = this.setLastWebcamPosition.bind(this);
    this.setisMinWidth = this.setisMinWidth.bind(this);
    this.setDropOnBottom = this.setDropOnBottom.bind(this);

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
      && !resetPosition) this.setResetPosition(true);

    window.addEventListener('resize', this.eventResizeListener);
    window.addEventListener('videoFocusChange', this.eventVideoFocusChangeListener);

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleFullscreenChange);
    });

    // Ensures that the event will be called before the resize
    document.addEventListener('webcamFullscreenButtonChange', this.fullscreenButtonChange);

    window.addEventListener('videoListUsersChange', this.getVideoListUsersChange);
  }

  componentDidUpdate(prevProps, prevState) {
    const { swapLayout } = this.props;
    const { userLength, lastPosition } = this.state;
    const { y } = lastPosition;
    // if (prevProps.swapLayout && !swapLayout && userLength === 1) {
    //   this.setShouldUpdatePosition(false);
    // }
    if (prevProps.swapLayout && !swapLayout && userLength > 1) {
      this.setLastPosition(0, y);
    }
    if (prevState.userLength === 1 && userLength > 1) {
      this.setDropOnBottom(true);
      this.setResetPosition(true);
    }
  }

  componentWillUnmount() {
    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, this.fullScreenToggleCallback);
    });

    document.removeEventListener('webcamFullscreenButtonChange', this.fullscreenButtonChange);
  }

  getVideoListUsersChange() {
    const userLength = WebcamDraggableOverlay.getWebcamBySelectorCount();
    this.setState({ userLength });
  }

  setIsFullScreen(isFullScreen) {
    this.setState({ isFullScreen });
  }

  setResetPosition(resetPosition) {
    this.setState({ resetPosition });
  }

  setLastPosition(x, y) {
    this.setState({ lastPosition: { x, y } });
  }

  setShouldUpdatePosition(shouldUpdatePosition) {
    this.setState({ shouldUpdatePosition });
  }

  setDropOnBottom(dropOnBottom) {
    this.setState({ dropOnBottom });
  }

  setInitialReferencePoint() {
    const { refMediaContainer } = this.props;
    const { userLength, shouldUpdatePosition } = this.state;
    const { current: mediaContainer } = refMediaContainer;

    const webcamBySelector = WebcamDraggableOverlay.getWebcamBySelector();

    if (webcamBySelector && mediaContainer && shouldUpdatePosition) {
      if (userLength === 0) this.getVideoListUsersChange();

      let x = 0;
      let y = 0;

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

      x = mediaWidth - ((webcamWidth + 10) * userLength); // 10 is margin
      y = mediaHeight - ((webcamHeight + 10) * lineNum); // 10 is margin

      if (x === 0 && y === 0) return false;

      this.setState({ initialRectPosition: { x, y } });
      return true;
    }
    return false;
  }

  setLastWebcamPosition() {
    const { refMediaContainer } = this.props;
    const { current: mediaContainer } = refMediaContainer;
    const { initialRectPosition, userLength, shouldUpdatePosition } = this.state;

    const { x: initX, y: initY } = initialRectPosition;
    const webcamBySelector = WebcamDraggableOverlay.getWebcamBySelector();

    if (webcamBySelector && mediaContainer && shouldUpdatePosition) {
      const webcamBySelectorRect = webcamBySelector.getBoundingClientRect();
      const {
        left: webcamLeft,
        top: webcamTop,
        height: webcamHeight,
      } = webcamBySelectorRect;

      const mediaContainerRect = mediaContainer.getBoundingClientRect();
      const {
        left: mediaLeft,
        top: mediaTop,
      } = mediaContainerRect;

      const webcamXByMedia = userLength > 1 ? 0 : webcamLeft - mediaLeft;
      const webcamYByMedia = webcamTop - mediaTop;

      let x = 0;
      let y = 0;

      if (webcamXByMedia > 0) {
        x = webcamXByMedia - initX;
      } else {
        x = 0 - initX;
      }
      if (userLength > 1) x = 0;

      if (webcamYByMedia > 0) {
        y = webcamYByMedia - initY;
      } else {
        y = 0 - initY;
      }

      if (webcamYByMedia > initY) {
        y = -10;
      }

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
      this.setState({ dropOnBottom: true });
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

  handleWebcamDragStart() {
    const { floatingOverlay } = this.props;
    const {
      dragging,
      showDropZones,
      dropOnTop,
      dropOnBottom,
      resetPosition,
    } = this.state;

    if (!floatingOverlay) WebcamDraggableOverlay.getOverlayBySelector().style.bottom = 0;

    if (!dragging) this.setState({ dragging: true });
    if (!showDropZones) this.setState({ showDropZones: true });
    if (dropOnTop) this.setState({ dropOnTop: false });
    if (dropOnBottom) this.setState({ dropOnBottom: false });
    if (resetPosition) this.setState({ resetPosition: false });
    window.dispatchEvent(new Event('resize'));
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
    } = this.props;
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

    const webcamBySelectorCount = WebcamDraggableOverlay.getWebcamBySelectorCount();

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.overlayRelative]: (dropOnTop || dropOnBottom),
      [styles.overlayAbsoluteSingle]: (!dropOnTop && !dropOnBottom && webcamBySelectorCount <= 1),
      [styles.overlayAbsoluteMult]: (!dropOnTop && !dropOnBottom && webcamBySelectorCount > 1),
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
          style={{ height: '100px' }}
        />
        <div
          className={dropZoneBgTopClassName}
          style={{ height: '100px' }}
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
          >
            {
              !disableVideo && !audioModalIsOpen
                ? (
                  <VideoProviderContainer
                    cursor={cursor()}
                    swapLayout={swapLayout}
                    mediaHeight={mediaHeight}
                    onMount={this.videoMounted}
                    onUpdate={this.videoUpdated}
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
          style={{ height: '100px' }}
        />
        <div
          className={dropZoneBgBottomClassName}
          style={{ height: '100px' }}
        />
      </Fragment>
    );
  }
}

WebcamDraggableOverlay.propTypes = propTypes;
WebcamDraggableOverlay.defaultProps = defaultProps;
