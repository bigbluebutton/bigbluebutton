import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.scss';

const MESSAGE_INTERVAL = 50;

export default class ShapeDrawListener extends Component {
  constructor(props) {
    super(props);

    this.initialCoordinate = {
      x: undefined,
      y: undefined,
    };
    this.lastSentCoordinate = {
      x: undefined,
      y: undefined,
    };
    this.currentCoordinate = {
      x: undefined,
      y: undefined,
    };

    // to track the status of drawing
    this.isDrawing = false;

    // id of the setInterval()
    this.intervalId = 0;

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.resetState = this.resetState.bind(this);
    this.sendLastMessage = this.sendLastMessage.bind(this);
    this.sendCoordinates = this.sendCoordinates.bind(this);
  }

  componentDidMount() {
    // to send the last message if the user refreshes the page while drawing
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

      // sending the first message
      const svgPoint = getSvgPoint(event);
      this.handleDrawCommonAnnotation({ x: svgPoint.x, y: svgPoint.y }, { x: svgPoint.x, y: svgPoint.y }, 'DRAW_START', generateNewShapeId(), this.props.drawSettings.tool);

      // saving the coordinates for future references
      this.initialCoordinate = {
        x: svgPoint.x,
        y: svgPoint.y,
      };
      this.lastSentCoordinate = {
        x: svgPoint.x,
        y: svgPoint.y,
      };
      this.currentCoordinate = {
        x: svgPoint.x,
        y: svgPoint.y,
      };

      // All the DRAW_UPDATE messages will be send on timer by sendCoordinates func
      this.intervalId = setInterval(this.sendCoordinates, MESSAGE_INTERVAL);

      // Sometimes when you Alt+Tab while drawing it can happen that your mouse is up,
      // but the browser didn't catch it. So check it here.
    } else {
      this.sendLastMessage();
    }
  }

  // main mouse move handler
  // calls a mouseMove<AnnotationName> handler based on the tool selected
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

      // saving the last sent coordinate
      this.currentCoordinate = transformedSvgPoint;
    }
  }

  // main mouse up handler
  mouseUpHandler() {
    this.sendLastMessage();
  }

  sendCoordinates() {
    if (this.isDrawing) {
      if (this.currentCoordinate.x !== this.lastSentCoordinate.x ||
          this.currentCoordinate.y !== this.lastSentCoordinate.y) {
        const { getCurrentShapeId } = this.props.actions;
        this.handleDrawCommonAnnotation(this.initialCoordinate, this.currentCoordinate, 'DRAW_UPDATE', getCurrentShapeId(), this.props.drawSettings.tool);
        this.lastSentCoordinate = this.currentCoordinate;
      }
    }
  }

  sendLastMessage() {
    // last message, clearing the interval
    clearInterval(this.intervalId);
    this.intervalId = 0;

    if (this.isDrawing) {
      const { getCurrentShapeId } = this.props.actions;
      this.handleDrawCommonAnnotation(this.initialCoordinate, this.currentCoordinate, 'DRAW_END', getCurrentShapeId(), this.props.drawSettings.tool);
      this.resetState();
    }
  }

  resetState() {
    // resetting the current state
    window.removeEventListener('mouseup', this.mouseUpHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler, true);
    this.isDrawing = false;
    this.initialCoordinate = {
      x: undefined,
      y: undefined,
    };
    this.lastSentCoordinate = {
      x: undefined,
      y: undefined,
    };
    this.currentCoordinate = {
      x: undefined,
      y: undefined,
    };
  }

  // since Rectangle / Triangle / Ellipse / Line have the same coordinate structure
  // we use the same function for all of them
  handleDrawCommonAnnotation(startPoint, endPoint, status, id, shapeType) {
    const { normalizeThickness, sendAnnotation } = this.props.actions;

    const annotation = {
      id,
      status,
      annotationType: shapeType,
      annotationInfo: {
        color: this.props.drawSettings.color,
        thickness: normalizeThickness(this.props.drawSettings.thickness),
        points: [
          startPoint.x,
          startPoint.y,
          endPoint.x,
          endPoint.y,
        ],
        id,
        whiteboardId: this.props.whiteboardId,
        status,
        type: shapeType,
      },
      wbId: this.props.whiteboardId,
      userId: this.props.userId,
      position: 0,
    };

    sendAnnotation(annotation);
  }

  render() {
    const tool = this.props.drawSettings.tool;
    return (
      <div
        role="presentation"
        className={styles[tool]}
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.mouseDownHandler}
      />
    );
  }
}

ShapeDrawListener.propTypes = {
  // Defines a whiteboard id, which needed to publish an annotation message
  whiteboardId: PropTypes.string.isRequired,
  // Defines a user id, which needed to publish an annotation message
  userId: PropTypes.string.isRequired,
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
    // The name of the tool currently selected
    tool: PropTypes.string.isRequired,
  }).isRequired,
};
