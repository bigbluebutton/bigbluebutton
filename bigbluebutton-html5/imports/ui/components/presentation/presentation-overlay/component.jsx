import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import SlideCalcUtil, {
  HUNDRED_PERCENT, MAX_PERCENT, STEP,
} from '/imports/utils/slideCalcUtils';
import {Meteor} from "meteor/meteor";
// After lots of trial and error on why synching doesn't work properly, I found I had to
// multiply the coordinates by 2. There's something I don't understand probably on the
// canvas coordinate system. (ralam feb 22, 2012)

import PresentationService from '../service';
import { makeCall } from '/imports/ui/services/api';

// maximum value of z-index to prevent other things from overlapping
const MAX_Z_INDEX = (2 ** 31) - 1;
const HAND_TOOL = 'hand';
const MOUSE_INTERVAL = 32;
const COS30 = 0.866;
const FLICKTHRES = 30;

export default class PresentationOverlay extends Component {
  static calculateDistance(touches) {
    return Math.sqrt(((touches[0].clientX - touches[1].clientX) ** 2)
                     + ((touches[0].clientY - touches[1].clientY) ** 2));
  }

  static touchCenterPoint(touches) {
    let totalX = 0; let
      totalY = 0;

    for (let i = 0; i < touches.length; i += 1) {
      totalX += touches[i].clientX;
      totalY += touches[i].clientY;
    }

    return { x: totalX / touches.length, y: totalY / touches.length };
  }

  constructor(props) {
    super(props);

    this.currentMouseX = 0;
    this.currentMouseY = 0;

    // Used only for dragging by a touch
    this.currentTouchX = 0;
    this.currentTouchY = 0;
    
    this.prevZoom = props.zoom;

    this.state = {
      pressed: false,
    };

    // Mobile Firefox has a bug where e.preventDefault on touchstart doesn't prevent
    // onmousedown from triggering right after. Thus we have to track it manually.
    // In case if it's fixed one day - there is another issue, React one.
    // https://github.com/facebook/react/issues/9809
    // Check it to figure if you can add onTouchStart in render(), or should use raw DOM api
    this.touchStarted = false;

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = throttle(this.handleTouchMove.bind(this), MOUSE_INTERVAL);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.mouseMoveHandler = throttle(this.mouseMoveHandler.bind(this), MOUSE_INTERVAL);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.mouseZoomHandler = this.mouseZoomHandler.bind(this);

    this.tapedTwice = false;
    this.selectAnnotation = this.selectAnnotation.bind(this);
    this.isPointInStroke = this.isPointInStroke.bind(this);
    this.pointerBeforeDragX = 0;
    this.pointerBeforeDragY = 0;
    this.time = Date.now();
    this.flick = 0;
  }

  componentDidMount() {
    const {
      zoom,
      slideWidth,
      svgWidth,
      svgHeight,
      userIsPresenter,
      presentationWindow,
    } = this.props;

    if (userIsPresenter) {
      this.viewBoxW = slideWidth / zoom * HUNDRED_PERCENT;
      this.viewBoxH = svgHeight / svgWidth * this.viewBoxW;

      this.doWidthBoundsDetection();
      this.doHeightBoundsDetection();

      this.pushSlideUpdate();
    }
    presentationWindow.addEventListener('keydown', this.keyDownHandler);
  }

  componentDidUpdate(prevProps) {
    const {
      zoom,
      fitToWidth,
      svgWidth,
      svgHeight,
      slideWidth,
      userIsPresenter,
      slide,
    } = this.props;

    if (!userIsPresenter) return;

    if (zoom !== this.prevZoom) {
      this.toolbarZoom();
    }

    if (fitToWidth !== prevProps.fitToWidth
      || this.checkResize(prevProps.svgWidth, prevProps.svgHeight)
      || slide.id !== prevProps.slide.id) {
      this.viewBoxW = slideWidth / zoom * HUNDRED_PERCENT;
      this.viewBoxH = svgHeight / svgWidth * this.viewBoxW;

      this.doWidthBoundsDetection();
      this.doHeightBoundsDetection();

      this.pushSlideUpdate();
    }
  }

  componentWillUnmount() {
    const { presentationWindow } = this.props;
    presentationWindow.removeEventListener('mousemove', this.mouseMoveHandler);
    presentationWindow.removeEventListener('mouseup', this.mouseUpHandler);
    presentationWindow.removeEventListener('keydown', this.keyDownHandler)
  }

  getTransformedSvgPoint(clientX, clientY) {
    const {
      getSvgRef,
    } = this.props;
    const svgObject = getSvgRef();
    // If svgObject is not ready, return origin
    if (!svgObject) return { x: 0, y: 0 };
    const screenPoint = svgObject.createSVGPoint();
    screenPoint.x = clientX;
    screenPoint.y = clientY;
    // transform a screen point to svg point
    const CTM = svgObject.getScreenCTM();

    return screenPoint.matrixTransform(CTM.inverse());
  }

  pushSlideUpdate() {
    const {
      updateLocalPosition,
      panAndZoomChanger,
    } = this.props;

    if (this.didPositionChange()) {
      this.calcViewedRegion();
      updateLocalPosition(
        this.viewBoxX, this.viewBoxY,
        this.viewBoxW, this.viewBoxH,
        this.prevZoom,
      );
      panAndZoomChanger(
        this.viewedRegionW, this.viewedRegionH,
        this.viewedRegionX, this.viewedRegionY,
      );
    }
  }

  checkResize(prevWidth, prevHeight) {
    const {
      svgWidth,
      svgHeight,
    } = this.props;

    const heightChanged = svgWidth !== prevWidth;
    const widthChanged = svgHeight !== prevHeight;
    return heightChanged || widthChanged;
  }

  didPositionChange() {
    const {
      viewBoxX,
      viewBoxY,
      viewBoxWidth,
      viewBoxHeight,
    } = this.props;

    return this.viewBoxX !== viewBoxX || this.viewBoxY !== viewBoxY
      || this.viewBoxW !== viewBoxWidth || this.viewBoxH !== viewBoxHeight;
  }

  panSlide(deltaX, deltaY) {
    const {
      zoom,
    } = this.props;
    this.viewBoxX += deltaX;
    this.viewBoxY += deltaY;
    this.doHeightBoundsDetection();
    this.doWidthBoundsDetection();

    this.prevZoom = zoom;
    this.pushSlideUpdate();
  }

  toolbarZoom() {
    const { zoom } = this.props;

    const viewPortCenterX = this.viewBoxW / 2 + this.viewBoxX;
    const viewPortCenterY = this.viewBoxH / 2 + this.viewBoxY;
    this.doZoomCall(zoom, viewPortCenterX, viewPortCenterY);
  }

  doWidthBoundsDetection() {
    const {
      slideWidth,
    } = this.props;

    const verifyPositionToBound = (this.viewBoxW + this.viewBoxX);
    if (this.viewBoxX <= 0) {
      this.viewBoxX = 0;
    } else if (verifyPositionToBound > slideWidth) {
      this.viewBoxX = (slideWidth - this.viewBoxW);
    }
  }

  doHeightBoundsDetection() {
    const {
      slideHeight,
    } = this.props;

    const verifyPositionToBound = (this.viewBoxH + this.viewBoxY);
    if (this.viewBoxY < 0) {
      this.viewBoxY = 0;
    } else if (verifyPositionToBound > slideHeight) {
      this.viewBoxY = (slideHeight - this.viewBoxH);
    }
  }

  calcViewedRegion() {
    const {
      slideWidth,
      slideHeight,
    } = this.props;

    this.viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(this.viewBoxW, slideWidth);
    this.viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(this.viewBoxH, slideHeight);
    this.viewedRegionX = SlideCalcUtil.calcViewedRegionX(this.viewBoxX, slideWidth);
    this.viewedRegionY = SlideCalcUtil.calcViewedRegionY(this.viewBoxY, slideHeight);
  }

  // receives an svg coordinate and changes the values to percentages of the slide's width/height
  svgCoordinateToPercentages(svgPoint) {
    const {
      slideWidth,
      slideHeight,
    } = this.props;

    const point = {
      x: (svgPoint.x / slideWidth) * 100,
      y: (svgPoint.y / slideHeight) * 100,
    };

    return point;
  }

  doZoomCall(zoom, mouseX, mouseY) {
    const {
      svgWidth,
      svgHeight,
      slideWidth,
    } = this.props;

    const relXcoordInViewport = (mouseX - this.viewBoxX) / this.viewBoxW;
    const relYcoordInViewport = (mouseY - this.viewBoxY) / this.viewBoxH;

    this.viewBoxW = slideWidth / zoom * HUNDRED_PERCENT;
    this.viewBoxH = svgHeight / svgWidth * this.viewBoxW;

    this.viewBoxX = mouseX - (relXcoordInViewport * this.viewBoxW);
    this.viewBoxY = mouseY - (relYcoordInViewport * this.viewBoxH);

    this.doWidthBoundsDetection();
    this.doHeightBoundsDetection();

    this.prevZoom = zoom;
    this.pushSlideUpdate();
  }

  mouseZoomHandler(e) {
    const {
      zoom,
      userIsPresenter,
    } = this.props;

    if (!userIsPresenter) return;

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

    if (newZoom === zoom) return;

    const svgPosition = this.getTransformedSvgPoint(e.clientX, e.clientY);
    this.doZoomCall(newZoom, svgPosition.x, svgPosition.y);
  }

  pinchStartHandler(event) {
    if (!this.pinchGesture) return;

    this.prevDiff = PresentationOverlay.calculateDistance(event.touches);
  }

  pinchMoveHandler(event) {
    const {
      zoom,
    } = this.props;

    if (!this.pinchGesture) return;
    if (event.touches.length < 2) return;

    const touchCenterPoint = PresentationOverlay.touchCenterPoint(event.touches);
    const currDiff = PresentationOverlay.calculateDistance(event.touches);

    if (currDiff > 0) {
      let newZoom = zoom + (currDiff - this.prevDiff);
      if (newZoom <= HUNDRED_PERCENT) {
        newZoom = HUNDRED_PERCENT;
      } else if (newZoom >= MAX_PERCENT) {
        newZoom = MAX_PERCENT;
      }
      const svgPosition = this.getTransformedSvgPoint(touchCenterPoint.x, touchCenterPoint.y);
      this.doZoomCall(newZoom, svgPosition.x, svgPosition.y);
    }
    this.prevDiff = currDiff;
  }

  panStartHandler(event) {
    if (this.pinchGesture) return;

    const touchCenterPoint = PresentationOverlay.touchCenterPoint(event.touches);
    this.currentMouseX = touchCenterPoint.x;
    this.currentMouseY = touchCenterPoint.y;
  }

  panMoveHandler(event) {
    const {
      slideHeight,
      physicalSlideHeight,
    } = this.props;

    if (this.pinchGesture) return;

    const touchCenterPoint = PresentationOverlay.touchCenterPoint(event.touches);

    const physicalRatio = slideHeight / physicalSlideHeight;
    const mouseDeltaX = physicalRatio * (this.currentMouseX - touchCenterPoint.x);
    const mouseDeltaY = physicalRatio * (this.currentMouseY - touchCenterPoint.y);
    this.currentMouseX = touchCenterPoint.x;
    this.currentMouseY = touchCenterPoint.y;
    this.panSlide(mouseDeltaX, mouseDeltaY);
  }

  selectAnnotation(pointerX, pointerY, event){
    const {
      slide,
      getSvgRef,
      presentationWindow,
    } = this.props;

    const annotations = PresentationService.getCurrentAnnotationsId(slide.id);
    const svgPosition = this.getTransformedSvgPoint(pointerX, pointerY);
    const svgObject = getSvgRef();
    const keys = [];
    for (let i in annotations) {
      keys.unshift(i);
    }
    let hitObj;
    for (let key of keys) {
      const elem = presentationWindow.document.getElementById(annotations[key].id);
      if (elem) { // can be negative for isolated whiteboard
        const type = annotations[key].annotationType;
        let bboxTL = svgObject.createSVGPoint();
        let bboxBR = svgObject.createSVGPoint();
        const strokeWidth =  elem.getAttribute('stroke-width');
        const fill =  elem.getAttribute('fill');
        const minStep = 20.0 ;
        const step = strokeWidth / 2 / COS30 > minStep ? strokeWidth / 2 / COS30 : minStep;
        if (type == 'text') {
          const domBB = elem.getBoundingClientRect();
          bboxTL = this.getTransformedSvgPoint(domBB.left, domBB.top);
          bboxBR = this.getTransformedSvgPoint(domBB.right, domBB.bottom);
        } else {
          let svgBB =  elem.getBBox();
          // For a point drawn by clicking with a pencil tool
          if (svgBB.width == 0) { svgBB.width = strokeWidth; }
          if (svgBB.height == 0) { svgBB.height = strokeWidth; }
          bboxTL.x = svgBB.x;
          bboxTL.y = svgBB.y;
          bboxBR.x = svgBB.x + svgBB.width;
          bboxBR.y = svgBB.y + svgBB.height;
        }
        if ( svgPosition.x > bboxTL.x - strokeWidth / 2 &&
             svgPosition.x < bboxBR.x + strokeWidth / 2 &&
             svgPosition.y > bboxTL.y - strokeWidth / 2 &&
             svgPosition.y < bboxBR.y + strokeWidth / 2 ) {
          if (type == 'text'){
            hitObj = key;
          } else {
            if ( fill != "none"  && elem.isPointInFill(svgPosition) ) {
              hitObj = key;
            } else if (this.isPointInStroke(svgPosition, elem, step) ) {
              //elem.isPointInStroke(svgPosition) can also be used, but we use a home-made method so that we can flexibly expand the hit region
              hitObj = key;
            }
          }
          if (hitObj) {
            break;
          }
        }
      }
    }
    if (hitObj) {
      const isSelected = PresentationService.isAnnotationSelected(slide.id, annotations[hitObj].id);
      if (!isSelected) {
        if (! event.ctrlKey) {
          PresentationService.handleUnselectAllAnnotations(slide.id);
        }
        PresentationService.handleSelectAnnotation(slide.id, annotations[hitObj].id);
      } else {
        if (event.ctrlKey) {
          PresentationService.handleUnselectAnnotation(slide.id, annotations[hitObj].id);
        }
      }
    } else {
      if (! event.ctrlKey) {
        PresentationService.handleUnselectAllAnnotations(slide.id);
      }
    }
  }

  tapHandler(event) {
    const { annotationTool } = this.props;

    if (event.touches.length === 2) return;
    if (!this.tapedTwice) {
      this.tapedTwice = true;
      setTimeout(() => (this.tapedTwice = false), 300);
      return;
    }
    event.preventDefault();
    const sizeDefault = this.prevZoom === HUNDRED_PERCENT;

    if (sizeDefault && annotationTool === HAND_TOOL) {
      const touchCenterPoint = PresentationOverlay.touchCenterPoint(event.touches);
      this.currentMouseX = touchCenterPoint.x;
      this.currentMouseY = touchCenterPoint.y;
      this.doZoomCall(200, touchCenterPoint.x, touchCenterPoint.y);
      return;
    }
    this.doZoomCall(HUNDRED_PERCENT, 0, 0);
  }

  handleTouchStart(event) {
    const {
      annotationTool,
      presentationWindow,
    } = this.props;

    if (annotationTool !== HAND_TOOL) return;
    // to prevent default behavior (scrolling) on devices (in Safari), when you draw a text box
    presentationWindow.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    presentationWindow.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    presentationWindow.addEventListener('touchcancel', this.handleTouchCancel, true);

    this.touchStarted = true;
    this.time = Date.now();

    const numberTouches = event.touches.length;
    if (numberTouches === 2) {
      this.pinchGesture = true;
      this.pinchStartHandler(event);
    } else if (numberTouches === 1) {
      this.pinchGesture = false;
      const touchCenterPoint = PresentationOverlay.touchCenterPoint(event.touches);
      this.selectAnnotation(touchCenterPoint.x, touchCenterPoint.y, event);
      this.currentTouchX = touchCenterPoint.x;
      this.currentTouchY = touchCenterPoint.y;
      this.panStartHandler(event);
    }

    // / TODO Figure out what to do with this later
    this.tapHandler(event);
  }

  handleTouchMove(event) {
    const {
      annotationTool,
      userIsPresenter,
      slide,
    } = this.props;

    if (annotationTool !== HAND_TOOL) return;

    const selectedAnnotations = PresentationService.getSelectedAnnotationsId(slide.id);
    
    event.preventDefault();

    if (userIsPresenter && this.pinchGesture) {
      this.pinchMoveHandler(event);
    } else if (userIsPresenter && selectedAnnotations.length == 0) {
      this.panMoveHandler(event);
    } else if (selectedAnnotations.length > 0) {
      const touchCenterPoint = PresentationOverlay.touchCenterPoint(event.touches);
      const interval = Date.now() - this.time;
      this.time = Date.now();
      this.flick = ((touchCenterPoint.x - this.currentTouchX)**2 + (touchCenterPoint.y - this.currentTouchY)**2) / interval;
      const newPoint = this.svgCoordinateToPercentages(this.getTransformedSvgPoint(touchCenterPoint.x, touchCenterPoint.y));
      const oldPoint = this.svgCoordinateToPercentages(this.getTransformedSvgPoint(this.currentTouchX, this.currentTouchY));
      const dx_percent = newPoint.x - oldPoint.x;
      const dy_percent = newPoint.y - oldPoint.y;
      this.currentTouchX = touchCenterPoint.x;
      this.currentTouchY = touchCenterPoint.y;
      this.draggedAnnotations = selectedAnnotations;
      PresentationService.moveSelectedAnnotations(slide.id, selectedAnnotations, dx_percent, dy_percent);
    }
  }

  handleTouchEnd(event) {
    const { 
      presentationWindow,
      slide,
    } = this.props;
    
    event.preventDefault();
    
    if (this.flick > FLICKTHRES) {
      const selectedAnnotations = PresentationService.getSelectedAnnotationsId(slide.id);
      makeCall('removeAnnotation', slide.id, selectedAnnotations);
      this.flick = 0;
    }
    
    // resetting the touchStarted flag
    this.touchStarted = false;

    presentationWindow.removeEventListener('touchend', this.handleTouchEnd, { passive: false });
    presentationWindow.removeEventListener('touchmove', this.handleTouchMove, { passive: false });
    presentationWindow.removeEventListener('touchcancel', this.handleTouchCancel, true);
  }

  handleTouchCancel(event) {
    const { presentationWindow } = this.props;
    event.preventDefault();

    presentationWindow.removeEventListener('touchend', this.handleTouchEnd, { passive: false });
    presentationWindow.removeEventListener('touchmove', this.handleTouchMove, { passive: false });
    presentationWindow.removeEventListener('touchcancel', this.handleTouchCancel, true);
  }

  keyDownHandler(event) {
    const {
      slide,
    } = this.props;

    const selectedAnnotations = PresentationService.getSelectedAnnotationsId(slide.id);
    if (event.code == 'Backspace'|| event.code == 'Delete') {
      makeCall('removeAnnotation', slide.id, selectedAnnotations);
    } else if (event.code == 'KeyA' && event.altKey && event.shiftKey) {
      PresentationService.selectAllAnnotation(slide.id);
    } else if (event.key == ']') {
      const orderContainer = PresentationService.bringAnnotations(slide.id, selectedAnnotations, true);
      if (orderContainer) {
        makeCall('reorderAnnotation', slide.id, selectedAnnotations, orderContainer);
      }
    } else if (event.key == '[') {
      const orderContainer = PresentationService.bringAnnotations(slide.id, selectedAnnotations, false);
      if (orderContainer) {
        makeCall('reorderAnnotation', slide.id, selectedAnnotations, orderContainer);
      }
    }
  }

  isPointInStroke(point, pathElement, step){
    const totalLen = pathElement.getTotalLength();
    for (let i=0 ; i < totalLen / step + 1 ; i++) {
      const posOnPath = pathElement.getPointAtLength(step * i);
      const dist2 = (posOnPath.x - point.x)**2 + (posOnPath.y - point.y)**2;
      if (dist2 < step**2) {
        return true;
      }
    }
    return false;
  }

  mouseDownHandler(event) {
    const {
      annotationTool,
      userIsPresenter,
      presentationWindow,
    } = this.props;

    if (annotationTool !== HAND_TOOL) return;

    const isLeftClick = event.button === 0;
    if (isLeftClick) {
      this.currentMouseX = event.clientX;
      this.currentMouseY = event.clientY;

      this.setState({
        pressed: true,
      });

      this.selectAnnotation(this.currentMouseX, this.currentMouseY, event);
      this.pointerBeforeDragX = this.currentMouseX;
      this.pointerBeforeDragY = this.currentMouseY;
      
      presentationWindow.addEventListener('mousemove', this.mouseMoveHandler, { passive: false });
      presentationWindow.addEventListener('mouseup', this.mouseUpHandler, { passive: false });
    }
  }

  mouseMoveHandler(event) {
    const {
      slideHeight,
      annotationTool,
      physicalSlideHeight,
      slide,
    } = this.props;

    const {
      pressed,
    } = this.state;

    if (annotationTool !== HAND_TOOL) return;

    const selectedAnnotations = PresentationService.getSelectedAnnotationsId(slide.id);
    
    if (pressed) {
      const mouseDeltaX = slideHeight / physicalSlideHeight * (this.currentMouseX - event.clientX);
      const mouseDeltaY = slideHeight / physicalSlideHeight * (this.currentMouseY - event.clientY);

      if (selectedAnnotations.length == 0) {
        this.panSlide(mouseDeltaX, mouseDeltaY);
      } else {
        const newPoint = this.svgCoordinateToPercentages(this.getTransformedSvgPoint(event.clientX, event.clientY));
        const oldPoint = this.svgCoordinateToPercentages(this.getTransformedSvgPoint(this.currentMouseX, this.currentMouseY));
        const dx_percent = newPoint.x - oldPoint.x
        const dy_percent = newPoint.y - oldPoint.y
        PresentationService.moveSelectedAnnotations(slide.id, selectedAnnotations, dx_percent, dy_percent);
      }
      
      this.currentMouseX = event.clientX;
      this.currentMouseY = event.clientY;
    }
  }

  mouseUpHandler(event) {
    const { slide, presentationWindow } = this.props;
    
    const {
      pressed,
    } = this.state;

    const isLeftClick = event.button === 0;

    if (isLeftClick && pressed) {
      this.setState({
        pressed: false,
      });

      const selectedAnnotations = PresentationService.getSelectedAnnotationsId(slide.id);
      const newPoint = this.svgCoordinateToPercentages(this.getTransformedSvgPoint(event.clientX, event.clientY));
      const oldPoint = this.svgCoordinateToPercentages(this.getTransformedSvgPoint(this.pointerBeforeDragX, this.pointerBeforeDragY));
      const offset = {x: newPoint.x - oldPoint.x, y: newPoint.y - oldPoint.y};
      this.pointerBeforeDragX = 0;
      this.pointerBeforeDragY = 0;
      if (offset.x != 0 || offset.y != 0){
        makeCall('moveAnnotation', slide.id, selectedAnnotations, offset);
      }
      
      presentationWindow.removeEventListener('mousemove', this.mouseMoveHandler);
      presentationWindow.removeEventListener('mouseup', this.mouseUpHandler);
    }
  }

  render() {
    const {
      viewBoxX,
      viewBoxY,
      viewBoxWidth,
      viewBoxHeight,
      slideWidth,
      slideHeight,
      children,
      userIsPresenter,
      isPresentationDetached,
    } = this.props;

    const {
      pressed,
    } = this.state;

    this.viewBoxW = viewBoxWidth;
    this.viewBoxH = viewBoxHeight;
    this.viewBoxX = viewBoxX;
    this.viewBoxY = viewBoxY;

    const hostUri = `https://${window.document.location.hostname}`;
    let baseName;
    if (isPresentationDetached) {
      baseName = hostUri + Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename + Meteor.settings.public.app.instanceId;
    } else {
      baseName = Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename + Meteor.settings.public.app.instanceId;
    }

    let cursor;
    if (!userIsPresenter) {
      cursor = undefined;
    } else if (pressed) {
      cursor = `url('${baseName}/resources/images/whiteboard-cursor/pan-closed.png') 4 8 ,  default`;
    } else {
      cursor = `url('${baseName}/resources/images/whiteboard-cursor/pan.png') 4 8,  default`;
    }

    const overlayStyle = {
      width: '100%',
      height: '100%',
      touchAction: 'none',
      zIndex: MAX_Z_INDEX,
      cursor,
    };

    return (
      <foreignObject
        clipPath="url(#viewBox)"
        x="0"
        y="0"
        width={slideWidth}
        height={slideHeight}
        style={{ zIndex: MAX_Z_INDEX }}
      >
        <div
          role="presentation"
          onTouchStart={this.handleTouchStart}
          onMouseDown={this.mouseDownHandler}
          onWheel={this.mouseZoomHandler}
          onBlur={() => {}}
          style={overlayStyle}
        >
          {children}
        </div>
      </foreignObject>
    );
  }
}

PresentationOverlay.propTypes = {
  // Defines a function which returns a reference to the main svg object
  getSvgRef: PropTypes.func.isRequired,

  // Defines the current zoom level (100 -> 400)
  zoom: PropTypes.number.isRequired,

  // Defines the width of the parent SVG. Used with svgHeight for aspect ratio
  svgWidth: PropTypes.number.isRequired,

  // Defines the height of the parent SVG. Used with svgWidth for aspect ratio
  svgHeight: PropTypes.number.isRequired,

  // Defines the calculated slide width (in svg coordinate system)
  slideWidth: PropTypes.number.isRequired,

  // Defines the calculated slide height (in svg coordinate system)
  slideHeight: PropTypes.number.isRequired,

  // Defines the local X value for the viewbox. Needed for pan/zoom
  viewBoxX: PropTypes.number.isRequired,

  // Defines the local Y value for the viewbox. Needed for pan/zoom
  viewBoxY: PropTypes.number.isRequired,

  // Defines the local width of the view box
  viewBoxWidth: PropTypes.number.isRequired,

  // Defines the local height of the view box
  viewBoxHeight: PropTypes.number.isRequired,

  // Defines the height of the slide in page coordinates for mouse movement
  physicalSlideHeight: PropTypes.number.isRequired,

  // Defines whether the local user has rights to change the slide position/dimensions
  userIsPresenter: PropTypes.bool.isRequired,

  // Defines whether the presentation area is in fitToWidth mode or not
  fitToWidth: PropTypes.bool.isRequired,

  // Defines the slide data. There's more in there, but we don't need it here
  slide: PropTypes.shape({
    // Defines the slide id. Used to tell if we changed slides
    id: PropTypes.string.isRequired,
  }).isRequired,

  // Defines a function to send the new viewbox position and size for presenter rendering
  updateLocalPosition: PropTypes.func.isRequired,

  // Defines a function to send the new percent based position and size to other users
  panAndZoomChanger: PropTypes.func.isRequired,

  // Defines the currently selected annotation tool. When "hand" we can pan
  annotationTool: PropTypes.string.isRequired,

  // As a child we expect only a WhiteboardOverlay at this point
  children: PropTypes.element.isRequired,
};
