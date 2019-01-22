import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SlideCalcUtil, {
  HUNDRED_PERCENT, MAX_PERCENT, MYSTERY_NUM, STEP,
} from '/imports/utils/slideCalcUtils';
import WhiteboardToolbarService from '../../whiteboard/whiteboard-toolbar/service';
// After lots of trial and error on why synching doesn't work properly, I found I had to
// multiply the coordinates by 2. There's something I don't understand probably on the
// canvas coordinate system. (ralam feb 22, 2012)

const CURSOR_INTERVAL = 16;

export default class PresentationOverlay extends Component {
  constructor(props) {
    super(props);

    // last sent coordinates
    this.lastSentClientX = 0;
    this.lastSentClientY = 0;

    // last updated coordinates
    this.currentClientX = 0;
    this.currentClientY = 0;

    // id of the setInterval()
    this.intervalId = 0;
    this.state = {
      zoom: props.zoom,
    };

    // Mobile Firefox has a bug where e.preventDefault on touchstart doesn't prevent
    // onmousedown from triggering right after. Thus we have to track it manually.
    // In case if it's fixed one day - there is another issue, React one.
    // https://github.com/facebook/react/issues/9809
    // Check it to figure if you can add onTouchStart in render(), or should use raw DOM api
    this.touchStarted = false;

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.checkCursor = this.checkCursor.bind(this);
    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseOutHandler = this.mouseOutHandler.bind(this);
    this.getTransformedSvgPoint = this.getTransformedSvgPoint.bind(this);
    this.svgCoordinateToPercentages = this.svgCoordinateToPercentages.bind(this);
    this.mouseZoomHandler = this.mouseZoomHandler.bind(this);
    this.zoomCalculation = this.zoomCalculation.bind(this);
    this.doZoomCall = this.doZoomCall.bind(this);
    this.tapHandler = this.tapHandler.bind(this);
    this.zoomCall = this.zoomCall.bind(this);

    this.panZoom = this.panZoom.bind(this);
    this.pinchZoom = this.pinchZoom.bind(this);
    this.toolbarZoom = this.toolbarZoom.bind(this);

    this.isPortraitDoc = this.isPortraitDoc.bind(this);
    this.doWidthBoundsDetection = this.doWidthBoundsDetection.bind(this);
    this.doHeightBoundsDetection = this.doHeightBoundsDetection.bind(this);
    this.calcViewedRegion = this.calcViewedRegion.bind(this);
    this.onZoom = this.onZoom.bind(this);

    const {
      viewBoxWidth,
      viewBoxHeight,
      slideWidth,
      slideHeight,
      slide,
      presentationSize,
    } = props;

    this.fitToPage = false;

    this.viewportW = slideWidth;
    this.viewportH = slideHeight;

    this.viewedRegionX = slide.xOffset;
    this.viewedRegionY = slide.yOffset;
    this.viewedRegionW = (viewBoxWidth / slideWidth) * 100;
    this.viewedRegionH = (viewBoxHeight / slideHeight) * 100;

    this.pageOrigW = slideWidth;
    this.pageOrigH = slideHeight;

    this.parentW = presentationSize.presentationWidth;
    this.parentH = presentationSize.presentationHeight;

    this.calcPageW = this.pageOrigW / (this.viewedRegionW / HUNDRED_PERCENT);
    this.calcPageH = this.pageOrigH / (this.viewedRegionH / HUNDRED_PERCENT);
    this.calcPageX = (this.viewedRegionX / HUNDRED_PERCENT) * this.calcPageW;
    this.calcPageY = (this.viewedRegionY / HUNDRED_PERCENT) * this.calcPageH;

    this.tapedTwice = false;
    this.touches = [];
  }

  componentDidMount() {
    const {
      viewBoxWidth,
      slideWidth,
      zoomChanger,
    } = this.props;

    const realZoom = (viewBoxWidth / slideWidth) * 100;

    const zoomPercentage = (Math.round((100 / realZoom) * 100));
    const roundedUpToFive = Math.round(zoomPercentage / 5) * 5;
    zoomChanger(roundedUpToFive);
  }

  componentDidUpdate(prevProps) {
    const {
      zoom,
      delta,
      touchZoom,
      presentationSize,
      slideHeight,
      slideWidth,
    } = this.props;
    const isDifferent = zoom !== this.state.zoom && !touchZoom;
    const moveSLide = ((delta.x !== prevProps.delta.x)
    || (delta.y !== prevProps.delta.y)) && !isDifferent;
    const isTouchZoom = zoom !== this.state.zoom && touchZoom;
    if (moveSLide) {
      this.panZoom();
    }

    if (isTouchZoom) {
      this.pinchZoom();
    }

    if (isDifferent) {
      this.toolbarZoom();
    }

    if (!prevProps.fitToWidth && this.props.fitToWidth) {
      this.parentH = presentationSize.presentationHeight;
      this.parentW = presentationSize.presentationWidth;
      this.viewportH = this.parentH;
      this.viewportW = this.parentW;
      this.doZoomCall(HUNDRED_PERCENT, 0, 0);
    }

    if (!this.props.fitToWidth && prevProps.fitToWidth) {
      this.viewportH = slideHeight;
      this.viewportW = slideWidth;
      this.doZoomCall(HUNDRED_PERCENT, 0, 0);
    }
  }

  onZoom(zoomValue, mouseX, mouseY) {
    let absXcoordInPage = (Math.abs(this.calcPageX) * MYSTERY_NUM) + mouseX;
    let absYcoordInPage = (Math.abs(this.calcPageY) * MYSTERY_NUM) + mouseY;

    const relXcoordInPage = absXcoordInPage / this.calcPageW;
    const relYcoordInPage = absYcoordInPage / this.calcPageH;

    if (this.isPortraitDoc() && this.fitToPage) {
      this.calcPageH = (this.viewportH * zoomValue) / HUNDRED_PERCENT;
      this.calcPageW = (this.pageOrigW / this.pageOrigH) * this.calcPageH;
    } else if (!this.isPortraitDoc() && this.fitToPage) {
      this.calcPageW = (this.viewportW * zoomValue) / HUNDRED_PERCENT;
      this.calcPageH = (this.viewportH * zoomValue) / HUNDRED_PERCENT;
    } else {
      this.calcPageW = (this.viewportW * zoomValue) / HUNDRED_PERCENT;
      this.calcPageH = (this.calcPageW / this.pageOrigW) * this.pageOrigH;
    }

    absXcoordInPage = relXcoordInPage * this.calcPageW;
    absYcoordInPage = relYcoordInPage * this.calcPageH;

    this.calcPageX = -((absXcoordInPage - mouseX) / MYSTERY_NUM);
    this.calcPageY = -((absYcoordInPage - mouseY) / MYSTERY_NUM);

    this.doWidthBoundsDetection();
    this.doHeightBoundsDetection();

    this.calcViewedRegion();
  }

  getTransformedSvgPoint(clientX, clientY) {
    const svgObject = this.props.getSvgRef();
    const screenPoint = svgObject.createSVGPoint();
    screenPoint.x = clientX;
    screenPoint.y = clientY;
    // transform a screen point to svg point
    const CTM = svgObject.getScreenCTM();

    return screenPoint.matrixTransform(CTM.inverse());
  }

  panZoom() {
    const {
      delta,
    } = this.props;
    this.deltaX = delta.x;
    this.deltaY = delta.y;
    this.calcPageX += delta.x * -1;
    this.calcPageY += delta.y * -1;
    this.doHeightBoundsDetection();
    this.doWidthBoundsDetection();
    this.calcViewedRegion();
    this.zoomCall(
      this.state.zoom,
      this.viewedRegionW,
      this.viewedRegionH,
      this.viewedRegionX,
      this.viewedRegionY,
    );
  }

  pinchZoom() {
    const {
      zoom,
    } = this.props;
    const posX = this.touches[0].clientX;
    const posY = this.touches[0].clientY;
    this.doZoomCall(zoom, posX, posY);
  }

  toolbarZoom() {
    const {
      getSvgRef,
      zoom,
    } = this.props;
    const svgRect = getSvgRef().getBoundingClientRect();
    const svgCenterX = svgRect.left + (svgRect.width / 2);
    const svgCenterY = svgRect.top + (svgRect.height / 2);
    this.doZoomCall(zoom, svgCenterX, svgCenterY);
  }

  isPortraitDoc() {
    return this.pageOrigH > this.pageOrigW;
  }

  doWidthBoundsDetection() {
    const verifyPositionToBound = (this.calcPageW + (this.calcPageX * MYSTERY_NUM));
    if (this.calcPageX >= 0) {
      this.calcPageX = 0;
    } else if (verifyPositionToBound < this.viewportW) {
      this.calcPageX = (this.viewportW - this.calcPageW) / MYSTERY_NUM;
    }
  }

  doHeightBoundsDetection() {
    const verifyPositionToBound = (this.calcPageH + (this.calcPageY * MYSTERY_NUM));
    if (this.calcPageY >= 0) {
      this.calcPageY = 0;
    } else if (verifyPositionToBound < this.viewportH) {
      this.calcPageY = (this.viewportH - this.calcPageH) / MYSTERY_NUM;
    }
  }

  calcViewedRegion() {
    this.viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(this.viewportW, this.calcPageW);
    this.viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(this.viewportH, this.calcPageH);
    this.viewedRegionX = SlideCalcUtil.calcViewedRegionX(this.calcPageX, this.calcPageW);
    this.viewedRegionY = SlideCalcUtil.calcViewedRegionY(this.calcPageY, this.calcPageH);
  }

  checkCursor() {
    // check if the cursor hasn't moved since last check
    if (this.lastSentClientX !== this.currentClientX
      || this.lastSentClientY !== this.currentClientY) {
      const { currentClientX, currentClientY } = this;
      // retrieving a transformed coordinate
      let transformedSvgPoint = this.getTransformedSvgPoint(currentClientX, currentClientY);

      // determining the cursor's coordinates as percentages from the slide's width/height
      transformedSvgPoint = this.svgCoordinateToPercentages(transformedSvgPoint);
      // updating last sent raw coordinates
      this.lastSentClientX = currentClientX;
      this.lastSentClientY = currentClientY;

      // sending the update to the server
      this.props.updateCursor({
        xPercent: transformedSvgPoint.x,
        yPercent: transformedSvgPoint.y,
        whiteboardId: this.props.whiteboardId,
      });
    }
  }

  // receives an svg coordinate and changes the values to percentages of the slide's width/height
  svgCoordinateToPercentages(svgPoint) {
    const point = {
      x: (svgPoint.x / this.props.slideWidth) * 100,
      y: (svgPoint.y / this.props.slideHeight) * 100,
    };

    return point;
  }

  zoomCalculation(zoom, mouseX, mouseY) {
    const svgPosition = this.getTransformedSvgPoint(mouseX, mouseY);
    this.onZoom(zoom, svgPosition.x, svgPosition.y);

    return {
      viewedRegionW: this.viewedRegionW,
      viewedRegionH: this.viewedRegionH,
      viewedRegionX: this.viewedRegionX,
      viewedRegionY: this.viewedRegionY,
    };
  }

  zoomCall(zoom, w, h, x, y) {
    const {
      zoomSlide,
      podId,
      currentSlideNum,
      isPresenter,
    } = this.props;
    if (!isPresenter) return;
    zoomSlide(currentSlideNum, podId, w, h, x, y);
    this.setState({ zoom });
    this.props.zoomChanger(zoom);
  }

  doZoomCall(zoom, mouseX, mouseY) {
    const zoomData = this.zoomCalculation(zoom, mouseX, mouseY);

    const {
      viewedRegionW,
      viewedRegionH,
      viewedRegionX,
      viewedRegionY,
    } = zoomData;

    this.zoomCall(zoom, viewedRegionW, viewedRegionH, viewedRegionX, viewedRegionY);
  }

  mouseZoomHandler(e) {
    const {
      zoom,
      whiteboardId,
      updateCursor,
    } = this.props;

    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom += STEP;
    }
    if (e.deltaY > 0) {
      newZoom -= STEP;
    }
    if (newZoom <= HUNDRED_PERCENT) {
      newZoom = HUNDRED_PERCENT;
    } else if (newZoom >= MAX_PERCENT) {
      newZoom = MAX_PERCENT;
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const svgPosition = this.getTransformedSvgPoint(mouseX, mouseY);
    const svgPercentage = this.svgCoordinateToPercentages(svgPosition);

    this.doZoomCall(newZoom, mouseX, mouseY);
    updateCursor({
      xPercent: svgPercentage.x,
      yPercent: svgPercentage.y,
      whiteboardId,
    });
  }

  tapHandler(event) {
    const AnnotationTool = WhiteboardToolbarService
      .getCurrentDrawSettings().whiteboardAnnotationTool;

    if (event.touches.length === 2) return;
    if (!this.tapedTwice) {
      this.tapedTwice = true;
      setTimeout(() => this.tapedTwice = false, 300);
      return;
    }
    event.preventDefault();
    const sizeDefault = this.state.zoom === HUNDRED_PERCENT;

    if (sizeDefault && AnnotationTool === 'hand') {
      this.doZoomCall(200, this.currentClientX, this.currentClientY);
      return;
    }
    this.doZoomCall(HUNDRED_PERCENT, 0, 0);
  }

  handleTouchStart(event) {
    // to prevent default behavior (scrolling) on devices (in Safari), when you draw a text box
    window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.addEventListener('touchcancel', this.handleTouchCancel, true);

    this.touchStarted = true;

    const { clientX, clientY } = event.changedTouches[0];
    this.currentClientX = clientX;
    this.currentClientY = clientY;
    if (event.touches.length === 2) {
      this.touches = [...event.touches];
    }

    const intervalId = setInterval(this.checkCursor, CURSOR_INTERVAL);
    this.intervalId = intervalId;
    this.tapHandler(event);
  }

  handleTouchMove(event) {
    event.preventDefault();

    const { clientX, clientY } = event.changedTouches[0];

    this.currentClientX = clientX;
    this.currentClientY = clientY;
  }

  handleTouchEnd(event) {
    event.preventDefault();

    // touch ended, removing the interval
    clearInterval(this.intervalId);
    this.intervalId = 0;

    // resetting the touchStarted flag
    this.touchStarted = false;

    // setting the coords to negative values and send the last message (the cursor will disappear)
    this.currentClientX = -1;
    this.currentClientY = -1;
    this.checkCursor();

    window.removeEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.removeEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.removeEventListener('touchcancel', this.handleTouchCancel, true);
  }

  handleTouchCancel(event) {
    event.preventDefault();

    // touch was cancelled, removing the interval
    clearInterval(this.intervalId);
    this.intervalId = 0;

    // resetting the touchStarted flag
    this.touchStarted = false;

    // setting the coords to negative values and send the last message (the cursor will disappear)
    this.currentClientX = -1;
    this.currentClientY = -1;
    this.checkCursor();

    window.removeEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.removeEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.removeEventListener('touchcancel', this.handleTouchCancel, true);
  }

  mouseMoveHandler(event) {
    if (this.touchStarted) {
      return;
    }
    // for the case where you change settings in one of the lists (which are displayed on the slide)
    // the mouse starts pointing to the slide right away and mouseEnter doesn't fire
    // so we call it manually here
    if (!this.intervalId) {
      this.mouseEnterHandler();
    }

    this.currentClientX = event.clientX;
    this.currentClientY = event.clientY;
  }

  mouseEnterHandler() {
    if (this.touchStarted) {
      return;
    }

    const intervalId = setInterval(this.checkCursor, CURSOR_INTERVAL);
    this.intervalId = intervalId;
  }

  mouseOutHandler() {
    // mouse left the whiteboard, removing the interval
    clearInterval(this.intervalId);
    this.intervalId = 0;

    // setting the coords to negative values and send the last message (the cursor will disappear)
    this.currentClientX = -1;
    this.currentClientY = -1;
    this.checkCursor();
  }

  render() {
    return (
      <foreignObject
        clipPath="url(#viewBox)"
        x="0"
        y="0"
        width={this.props.slideWidth}
        height={this.props.slideHeight}
        // maximun value of z-index to prevent other things from overlapping
        style={{ zIndex: 2 ** 31 - 1 }}
      >
        <div
          onTouchStart={this.handleTouchStart}
          onMouseOut={this.mouseOutHandler}
          onMouseEnter={this.mouseEnterHandler}
          onMouseMove={this.mouseMoveHandler}
          onWheel={this.mouseZoomHandler}
          onBlur={() => {}}
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
        >
          {this.props.children}
        </div>
      </foreignObject>
    );
  }
}

PresentationOverlay.propTypes = {
  whiteboardId: PropTypes.string.isRequired,

  // Defines a function which returns a reference to the main svg object
  getSvgRef: PropTypes.func.isRequired,

  // Defines the calculated slide width (in svg coordinate system)
  slideWidth: PropTypes.number.isRequired,

  // Defines the calculated slide height (in svg coordinate system)
  slideHeight: PropTypes.number.isRequired,

  // A function to send a cursor update
  updateCursor: PropTypes.func.isRequired,

  // As a child we expect only a WhiteboardOverlay at this point
  children: PropTypes.element.isRequired,
};
