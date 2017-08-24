import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.scss';

export default class PencilDrawListener extends Component {
  constructor() {
    super();

    // to track the status of drawing
    this.isDrawing = false;

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
  }

  // main mouse down handler
  mouseDownHandler(event) {
    if (!this.isDrawing) {
      window.addEventListener('mouseup', this.mouseUpHandler);
      window.addEventListener('mousemove', this.mouseMoveHandler, true);
      this.mouseDownPencil(event);
      this.isDrawing = true;

    // if you switch to a different window using Alt+Tab while mouse is down and release it
    // it wont catch mouseUp and will keep tracking the movements. Thus we need this check.
    } else {
      this.mouseUpHandler(event);
    }
  }

  // main mouse up handler
  mouseUpHandler(event) {
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    this.mouseUpPencil(event);

    this.isDrawing = false;
  }

  // main mouse move handler
  mouseMoveHandler(event) {
    this.mouseMovePencil(event);
  }

  mouseDownPencil(event) {
    const { getSvgPoint, generateNewShapeId } = this.props.actions;

    const svgPoint = getSvgPoint(event);
    const points = [svgPoint.x, svgPoint.y];
    this.handleDrawPencil(points, 'DRAW_START', generateNewShapeId());
  }

  mouseMovePencil(event) {
    const {
      checkIfOutOfBounds,
      getTransformedSvgPoint,
      svgCoordinateToPercentages,
      getCurrentShapeId,
    } = this.props.actions;

    // get the transformed svg coordinate
    let transformedSvgPoint = getTransformedSvgPoint(event);

    // check if it's out of bounds
    transformedSvgPoint = checkIfOutOfBounds(transformedSvgPoint);

    // transforming svg coordinate to percentages relative to the slide width/height
    transformedSvgPoint = svgCoordinateToPercentages(transformedSvgPoint);

    // adding new coordinates to the saved coordinates in the state
    const points = [transformedSvgPoint.x, transformedSvgPoint.y];

    // calling handleDrawPencil to send a message
    this.handleDrawPencil(points, 'DRAW_UPDATE', getCurrentShapeId());
  }

  mouseUpPencil() {
    const { slideWidth, slideHeight } = this.props;
    const { getCurrentShapeId } = this.props.actions;

    // for the last message we need to send the slide's width and height
    // It's just for the smoothing
    const points = [slideWidth, slideHeight];

    // calling handleDrawPencil to send a message
    this.handleDrawPencil(points, 'DRAW_END', getCurrentShapeId());
  }

  handleDrawPencil(points, status, id) {
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
        transparency: false,
        type: 'pencil',
      },
      wbId: whiteboardId,
      userId,
      position: 0,
    };

    sendAnnotation(annotation);
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
  // Defines the widith of the slide (svg coordinate system)
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system)
  slideHeight: PropTypes.number.isRequired,
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
