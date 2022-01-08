import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Meteor} from "meteor/meteor";

const ANNOTATION_CONFIG = Meteor.settings.public.whiteboard.annotations;
const DRAW_START = ANNOTATION_CONFIG.status.start;
const DRAW_UPDATE = ANNOTATION_CONFIG.status.update;
const DRAW_END = ANNOTATION_CONFIG.status.end;

// maximum value of z-index to prevent other things from overlapping
const MAX_Z_INDEX = (2 ** 31) - 1;
const POINTS_TO_BUFFER = 2;
const POINTS_TO_BUFFER_SYNC = Meteor.settings.public.app.defaultSettings.dataSaving.syncPencilPointsToBuffer;

export default class PencilDrawListener extends Component {
  constructor() {
    super();

    // to track the status of drawing
    this.isDrawing = false;
    this.points = [];

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.resetState = this.resetState.bind(this);
    this.sendLastMessage = this.sendLastMessage.bind(this);
    this.sendCoordinates = this.sendCoordinates.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
    this.discardAnnotation = this.discardAnnotation.bind(this);
    //this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    const { presentationWindow } = this.props;
    // to send the last DRAW_END message in case if a user reloads the page while drawing
    presentationWindow.addEventListener('beforeunload', this.sendLastMessage);
  }

  componentWillUnmount() {
    const { presentationWindow } = this.props;
    presentationWindow.removeEventListener('beforeunload', this.sendLastMessage);

    // sending the last message on componentDidUnmount
    this.sendLastMessage();
  }

  commonDrawStartHandler(clientX, clientY) {
    const {
      actions,
      drawSettings,
    } = this.props;

    const {
      getTransformedSvgPoint,
      generateNewShapeId,
      svgCoordinateToPercentages,
    } = actions;

    // changing isDrawing to true
    this.isDrawing = true;

    // sending the first message
    let transformedSvgPoint = getTransformedSvgPoint(clientX, clientY);

    // transforming svg coordinate to percentages relative to the slide width/height
    transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

    // sending the first message
    this.points = [transformedSvgPoint.x, transformedSvgPoint.y];
    this.handleDrawPencil(this.points, DRAW_START, generateNewShapeId(), undefined, drawSettings.tool);
  }

  commonDrawMoveHandler(clientX, clientY) {
    if (this.isDrawing) {
      const {
        actions,
        synchronizeWBUpdate,
      } = this.props;

      const {
        checkIfOutOfBounds,
        getTransformedSvgPoint,
        svgCoordinateToPercentages,
      } = actions;

      // get the transformed svg coordinate
      let transformedSvgPoint = getTransformedSvgPoint(clientX, clientY);

      // check if it's out of bounds
      transformedSvgPoint = checkIfOutOfBounds(transformedSvgPoint);

      // transforming svg coordinate to percentages relative to the slide width/height
      transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

      // saving the coordinate to the array
      this.points.push(transformedSvgPoint.x);
      this.points.push(transformedSvgPoint.y);

      if (this.points.length > (synchronizeWBUpdate ? POINTS_TO_BUFFER_SYNC : POINTS_TO_BUFFER)) {
        this.sendCoordinates();
      }
    }
  }
/*
  handleKeyDown(event) {
    const {
      physicalSlideWidth,
      physicalSlideHeight,
    } = this.props;

    const iter = this.points.length / 2;

    const d = {
      x: 1.0 * physicalSlideHeight /(physicalSlideWidth + physicalSlideHeight),
      y: 1.0 * physicalSlideWidth  /(physicalSlideWidth + physicalSlideHeight),
    };

    if        (event.keyCode == '38') { // up arrow
      for (let i = 0; i < iter; i++) {
        const move = -d.y * (this.points[i * 2 + 0] - this.points[this.points.length - 2]) /
                            (this.points[        0] - this.points[this.points.length - 2]);
        this.points[i * 2 + 1] += move;
      }
    } else if (event.keyCode == '40') { // down arrow
      for (let i = 0; i < iter; i++) {
        const move =  d.y * (this.points[i * 2 + 0] - this.points[this.points.length - 2]) /
                            (this.points[        0] - this.points[this.points.length - 2]);
        this.points[i * 2 + 1] += move;
      }
    } else if (event.keyCode == '37') { // left arrow
      for (let i = 0; i < iter; i++) {
        const move = -d.x * (this.points[i * 2 + 1] - this.points[this.points.length - 1]) /
                            (this.points[        1] - this.points[this.points.length - 1]);
        this.points[i * 2    ] += move;
      }
    } else if (event.keyCode == '39') { // right arrow
      for (let i = 0; i < iter; i++) {
        const move =  d.x * (this.points[i * 2 + 1] - this.points[this.points.length - 1]) /
                            (this.points[        1] - this.points[this.points.length - 1]);
        this.points[i * 2    ] += move;
      }
    }
    event.stopPropagation();
    this.sendCoordinates();
  }
*/
  handleTouchStart(event) {
    const { presentationWindow } = this.props;
    event.preventDefault();
    if (!this.isDrawing) {
      presentationWindow.addEventListener('touchend', this.handleTouchEnd, { passive: false });
      presentationWindow.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      presentationWindow.addEventListener('touchcancel', this.handleTouchCancel, true);
      //presentationWindow.addEventListener('keydown', this.handleKeyDown, true);

      const { clientX, clientY } = event.changedTouches[0];
      this.commonDrawStartHandler(clientX, clientY);

    // if you switch to a different window using Alt+Tab while mouse is down and release it
    // it wont catch mouseUp and will keep tracking the movements. Thus we need this check.
    } else {
      this.sendLastMessage();
    }
  }

  handleTouchMove(event) {
    event.preventDefault();
    const { clientX, clientY } = event.changedTouches[0];
    this.commonDrawMoveHandler(clientX, clientY);
  }

  handleTouchEnd() {
    this.sendLastMessage();
  }

  handleTouchCancel() {
    this.sendLastMessage();
  }

  // main mouse down handler
  mouseDownHandler(event) {
    const { presentationWindow } = this.props;
    const isLeftClick = event.button === 0;
    const isRightClick = event.button === 2;

    if (!this.isDrawing) {
      if (isLeftClick) {
        presentationWindow.addEventListener('mouseup', this.mouseUpHandler);
        presentationWindow.addEventListener('mousemove', this.mouseMoveHandler, true);
        //presentationWindow.addEventListener('keydown', this.handleKeyDown, true);

        const { clientX, clientY } = event;
        this.commonDrawStartHandler(clientX, clientY);
      }

    // if you switch to a different window using Alt+Tab while mouse is down and release it
    // it wont catch mouseUp and will keep tracking the movements. Thus we need this check.
    } else if (isRightClick) {
      this.discardAnnotation();
    }
  }

  // main mouse move handler
  mouseMoveHandler(event) {
    const { clientX, clientY } = event;
    this.commonDrawMoveHandler(clientX, clientY);
  }

  // main mouse up handler
  mouseUpHandler() {
    this.sendLastMessage();
  }

  sendCoordinates() {
    if (this.isDrawing && this.points.length > 0) {
      const {
        actions,
        drawSettings,
      } = this.props;

      const { getCurrentShapeId } = actions;
      this.handleDrawPencil(this.points, DRAW_UPDATE, getCurrentShapeId(), undefined, drawSettings.tool);
      this.points = []; // only new points will be sent
    }
  }

  handleDrawPencil(points, status, id, dimensions, pencilType) {
    const {
      whiteboardId,
      userId,
      actions,
      drawSettings,
      synchronizeWBUpdate,
    } = this.props;

    const {
      normalizeThickness,
      sendAnnotation,
    } = actions;

    const {
      thickness,
      color,
    } = drawSettings;

    if (status == DRAW_END && synchronizeWBUpdate && points.length === 2) {
      // To ensure a point is drawn by a single click,
      //  with a risk of unnecessary point added also for a normal drawing
      // If we simply revive sending DRAW_START to akka-apps, this would not be necessary (see whiteboard/service.js).
      points = points.concat(points);
    }
    
    const annotation = {
      id,
      status,
      annotationType: pencilType,
      annotationInfo: {
        color,
        thickness: normalizeThickness(thickness),
        points,
        id,
        whiteboardId,
        status,
        type: pencilType,
      },
      wbId: whiteboardId,
      userId,
      position: 0,
    };

    // dimensions are added to the 'DRAW_END', last message
    if (dimensions) {
      annotation.annotationInfo.dimensions = dimensions;
    }

    sendAnnotation(annotation, synchronizeWBUpdate); //whiteboardId seems unnecessary
  }

  sendLastMessage() {
    if (this.isDrawing) {
      const {
        physicalSlideWidth,
        physicalSlideHeight,
        actions,
        drawSettings,
      } = this.props;

      const { getCurrentShapeId } = actions;

      this.handleDrawPencil(
        this.points,
        DRAW_END,
        getCurrentShapeId(),
        [Math.round(physicalSlideWidth), Math.round(physicalSlideHeight)],
        drawSettings.tool,
      );
      this.resetState();
    }
  }

  resetState() {
    const { presentationWindow } = this.props;
    // resetting the current info
    this.points = [];
    this.isDrawing = false;
    // mouseup and mousemove are removed on desktop
    presentationWindow.removeEventListener('mouseup', this.mouseUpHandler);
    presentationWindow.removeEventListener('mousemove', this.mouseMoveHandler, true);
    //presentationWindow.removeEventListener('keydown', this.handleKeyDown, true);
    // touchend, touchmove and touchcancel are removed on devices
    presentationWindow.removeEventListener('touchend', this.handleTouchEnd, { passive: false });
    presentationWindow.removeEventListener('touchmove', this.handleTouchMove, { passive: false });
    presentationWindow.removeEventListener('touchcancel', this.handleTouchCancel, true);
  }

  discardAnnotation() {
    const {
      actions,
    } = this.props;

    const {
      getCurrentShapeId,
      clearPreview,
    } = actions;

    this.resetState();
    clearPreview(getCurrentShapeId());
  }

  render() {
    const {
      actions,
      drawSettings,
      isPresentationDetached,
    } = this.props;

    const { contextMenuHandler } = actions;
    
    const {
      tool,
    } = drawSettings;
    
    let baseName = Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename + Meteor.settings.public.app.instanceId;
    const hostUri = `https://${window.document.location.hostname}`;
    if (isPresentationDetached) {
      baseName = hostUri + baseName ;
    }
    const pencilDrawStyle = {
      width: '100%',
      height: '100%',
      touchAction: 'none',
      zIndex: MAX_Z_INDEX,
      cursor: `url('${baseName}/resources/images/whiteboard-cursor/${tool}.png') 2 22, default`,
    };

    return (
      <div
        onTouchStart={this.handleTouchStart}
        role="presentation"
        style={pencilDrawStyle}
        onMouseDown={this.mouseDownHandler}
        onContextMenu={contextMenuHandler}
      />
    );
  }
}

PencilDrawListener.propTypes = {
  // Defines a whiteboard id, which needed to publish an annotation message
  whiteboardId: PropTypes.string.isRequired,
  // Defines a user id, which needed to publish an annotation message
  userId: PropTypes.string.isRequired,
  // Defines the physical widith of the slide
  physicalSlideWidth: PropTypes.number.isRequired,
  // Defines the physical height of the slide
  physicalSlideHeight: PropTypes.number.isRequired,
  // Defines an object containing all available actions
  actions: PropTypes.shape({
    // Defines a function which transforms a coordinate from the window to svg coordinate system
    getTransformedSvgPoint: PropTypes.func.isRequired,
    // Defines a function which checks if the shape is out of bounds and returns
    // appropriate coordinates
    checkIfOutOfBounds: PropTypes.func.isRequired,
    // Defines a function which receives an svg point and transforms it into
    // percentage-based coordinates
    svgCoordinateToPercentages: PropTypes.func.isRequired,
    // Defines a function which returns a current shape id
    getCurrentShapeId: PropTypes.func.isRequired,
    // Defines a function which generates a new shape id
    generateNewShapeId: PropTypes.func.isRequired,
    // Defines a function which receives a thickness num and normalizes it before we send a message
    normalizeThickness: PropTypes.func.isRequired,
    // Defines a function which we use to publish a message to the server
    sendAnnotation: PropTypes.func.isRequired,
  }).isRequired,
  drawSettings: PropTypes.shape({
    // Annotation color
    color: PropTypes.number.isRequired,
    // Annotation thickness (not normalized)
    thickness: PropTypes.number.isRequired,
  }).isRequired,
};
