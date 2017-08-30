import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.scss';

const MESSAGE_INTERVAL = 50;

export default class PencilDrawListener extends Component {
  constructor() {
    super();

    // to track the status of drawing
    this.isDrawing = false;
    this.points = [];

    // id of the setInterval()
    this.intervalId = 0;

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.sendLastMessage = this.sendLastMessage.bind(this);
    this.sendCoordinates = this.sendCoordinates.bind(this);
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

  // main mouse down handler
  mouseDownHandler(event) {
    if (!this.isDrawing) {
      window.addEventListener('mouseup', this.mouseUpHandler);
      window.addEventListener('mousemove', this.mouseMoveHandler, true);
      this.isDrawing = true;

      const { getSvgPoint, generateNewShapeId } = this.props.actions;

      // transform the event's SVG-based coordinates into percentages
      const svgPoint = getSvgPoint(event);

      // sending the first message
      const _points = [svgPoint.x, svgPoint.y];
      this.handleDrawPencil(_points, 'DRAW_START', generateNewShapeId());

      // All the DRAW_UPDATE messages will be send on timer by sendCoordinates func
      this.intervalId = setInterval(this.sendCoordinates, MESSAGE_INTERVAL);

    // if you switch to a different window using Alt+Tab while mouse is down and release it
    // it wont catch mouseUp and will keep tracking the movements. Thus we need this check.
    } else {
      this.sendLastMessage();
    }
  }

  // main mouse move handler
  mouseMoveHandler(event) {
    if (this.isDrawing) {
      const {
        checkIfOutOfBounds,
        getTransformedSvgPoint,
        svgCoordinateToPercentages,
      } = this.props.actions;

      // get the transformed svg coordinate
      let transformedSvgPoint = getTransformedSvgPoint(event);

      // check if it's out of bounds
      transformedSvgPoint = checkIfOutOfBounds(transformedSvgPoint);

      // transforming svg coordinate to percentages relative to the slide width/height
      transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

      // saving the coordinate to the array
      this.points.push(transformedSvgPoint.x);
      this.points.push(transformedSvgPoint.y);
    }
  }

  // main mouse up handler
  mouseUpHandler() {
    this.sendLastMessage();
  }

  sendCoordinates() {
    if (this.isDrawing && this.points.length > 0) {
      const { getCurrentShapeId } = this.props.actions;
      this.handleDrawPencil(this.points, 'DRAW_UPDATE', getCurrentShapeId());
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
      console.log(dimensions);
      annotation.annotationInfo.dimensions = dimensions;
    }

    sendAnnotation(annotation);
  }

  sendLastMessage() {
    // last message, clearing the interval
    clearInterval(this.intervalId);
    this.intervalId = 0;

    if (this.isDrawing) {
      const { getCurrentShapeId } = this.props.actions;
      const { physicalSlideWidth, physicalSlideHeight } = this.props;

      this.handleDrawPencil(
        this.points,
        'DRAW_END',
        getCurrentShapeId(),
        [Math.round(physicalSlideWidth), Math.round(physicalSlideHeight)],
      );

      // resetting the current info
      this.points = [];
      this.isDrawing = false;
      window.removeEventListener('mouseup', this.mouseUpHandler);
      window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    }
  }

  render() {
    return (
      <div
        role="presentation"
        className={styles.pencil}
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.mouseDownHandler}
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
    // Defines a function that receives an event with the coordinates in the svg coordinate system
    // and transforms them into percentage-based coordinates
    getSvgPoint: PropTypes.func.isRequired,
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
