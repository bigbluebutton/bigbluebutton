import React, { Component } from 'react';
import PropTypes from 'prop-types';

const ANNOTATION_CONFIG = Meteor.settings.public.whiteboard.annotations;
const DRAW_START = ANNOTATION_CONFIG.status.start;
const DRAW_UPDATE = ANNOTATION_CONFIG.status.update;
const DRAW_END = ANNOTATION_CONFIG.status.end;

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
    this.contextMenuHandler = this.contextMenuHandler.bind(this);
  }

  componentDidMount() {
    // to send the last DRAW_END message in case if a user reloads the page while drawing
    window.addEventListener('beforeunload', this.sendLastMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.sendLastMessage);

    // sending the last message on componentDidUnmount
    this.sendLastMessage();
  }

  commonDrawStartHandler(clientX, clientY) {
    // changing isDrawing to true
    this.isDrawing = true;

    const {
      getTransformedSvgPoint,
      generateNewShapeId,
      svgCoordinateToPercentages,
    } = this.props.actions;

    // sending the first message
    let transformedSvgPoint = getTransformedSvgPoint(clientX, clientY);

    // transforming svg coordinate to percentages relative to the slide width/height
    transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

    // sending the first message
    const _points = [transformedSvgPoint.x, transformedSvgPoint.y];
    this.handleDrawPencil(_points, DRAW_START, generateNewShapeId());
  }

  commonDrawMoveHandler(clientX, clientY) {
    if (this.isDrawing) {
      const {
        checkIfOutOfBounds,
        getTransformedSvgPoint,
        svgCoordinateToPercentages,
      } = this.props.actions;

      // get the transformed svg coordinate
      let transformedSvgPoint = getTransformedSvgPoint(clientX, clientY);

      // check if it's out of bounds
      transformedSvgPoint = checkIfOutOfBounds(transformedSvgPoint);

      // transforming svg coordinate to percentages relative to the slide width/height
      transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

      // saving the coordinate to the array
      this.points.push(transformedSvgPoint.x);
      this.points.push(transformedSvgPoint.y);

      this.sendCoordinates();
    }
  }

  handleTouchStart(event) {
    event.preventDefault();
    if (!this.isDrawing) {
      window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
      window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      window.addEventListener('touchcancel', this.handleTouchCancel, true);

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
    if (event.button === 0) {
      if (!this.isDrawing) {
        window.addEventListener('mouseup', this.mouseUpHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler, true);

        const { clientX, clientY } = event;
        this.commonDrawStartHandler(clientX, clientY);

      // if you switch to a different window using Alt+Tab while mouse is down and release it
      // it wont catch mouseUp and will keep tracking the movements. Thus we need this check.
      } else {
        this.sendLastMessage();
      }
    } else if (event.button === 2) {
      this.props.actions.undoAnnotation(this.props.whiteboardId);
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
      const { getCurrentShapeId } = this.props.actions;
      this.handleDrawPencil(this.points, DRAW_UPDATE, getCurrentShapeId());
      this.points = [];
    }
  }

  handleDrawPencil(points, status, id, dimensions) {
    const { normalizeThickness, sendAnnotation } = this.props.actions;
    const { whiteboardId, userId } = this.props;

    const annotation = {
      id,
      status,
      annotationType: 'pencil',
      annotationInfo: {
        color: this.props.drawSettings.color,
        thickness: normalizeThickness(this.props.drawSettings.thickness),
        points,
        id,
        whiteboardId,
        status,
        type: 'pencil',
      },
      wbId: whiteboardId,
      userId,
      position: 0,
    };

    // dimensions are added to the 'DRAW_END', last message
    if (dimensions) {
      annotation.annotationInfo.dimensions = dimensions;
    }

    sendAnnotation(annotation);
  }

  sendLastMessage() {
    if (this.isDrawing) {
      const { getCurrentShapeId } = this.props.actions;
      const { physicalSlideWidth, physicalSlideHeight } = this.props;

      this.handleDrawPencil(
        this.points,
        DRAW_END,
        getCurrentShapeId(),
        [Math.round(physicalSlideWidth), Math.round(physicalSlideHeight)],
      );
      this.resetState();
    }
  }

  resetState() {
    // resetting the current info
    this.points = [];
    this.isDrawing = false;
    // mouseup and mousemove are removed on desktop
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    // touchend, touchmove and touchcancel are removed on devices
    window.removeEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.removeEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.removeEventListener('touchcancel', this.handleTouchCancel, true);
  }

  contextMenuHandler(event) {
    // disable showing context-menu when right click
    event.preventDefault();
    return this;
  }

  render() {
    const baseName = Meteor.settings.public.app.basename;
    const pencilDrawStyle = {
      width: '100%',
      height: '100%',
      touchAction: 'none',
      zIndex: 2 ** 31 - 1, // maximun value of z-index to prevent other things from overlapping
      cursor: `url('${baseName}/resources/images/whiteboard-cursor/pencil.png') 2 22, default`,
    };
    return (
      <div
        onTouchStart={this.handleTouchStart}
        role="presentation"
        style={pencilDrawStyle}
        onMouseDown={this.mouseDownHandler}
        onContextMenu={this.contextMenuHandler}
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
