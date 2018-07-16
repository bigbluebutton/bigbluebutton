import React, { Component } from 'react';
import PropTypes from 'prop-types';

const ANNOTATION_CONFIG = Meteor.settings.public.whiteboard.annotations;
const DRAW_START = ANNOTATION_CONFIG.status.start;
const DRAW_UPDATE = ANNOTATION_CONFIG.status.update;
const DRAW_END = ANNOTATION_CONFIG.status.end;

export default class ShapeDrawListener extends Component {
  constructor(props) {
    super(props);

    // there is no valid defaults for the coordinates, and we wouldn't want them anyway
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

    this.currentStatus = undefined;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
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
    // to send the last message if the user refreshes the page while drawing
    window.addEventListener('beforeunload', this.sendLastMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.sendLastMessage);

    // sending the last message on componentDidUnmount
    this.sendLastMessage();
  }

  commonDrawStartHandler(clientX, clientY) {
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

    // generating new shape id
    generateNewShapeId();

    // setting the initial current status
    this.currentStatus = DRAW_START;

    // saving the coordinates for future references
    this.initialCoordinate = {
      x: transformedSvgPoint.x,
      y: transformedSvgPoint.y,
    };

    this.currentCoordinate = {
      x: transformedSvgPoint.x,
      y: transformedSvgPoint.y,
    };

    // All the messages will be send on timer by sendCoordinates func
    this.sendCoordinates();
  }

  commonDrawMoveHandler(clientX, clientY) {
    if (!this.isDrawing) {
      return;
    }

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

    // saving the last sent coordinate
    this.currentCoordinate = transformedSvgPoint;
    this.sendCoordinates();
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
  handleMouseDown(event) {
    if (event.button === 0) {
      // Sometimes when you Alt+Tab while drawing it can happen that your mouse is up,
      // but the browser didn't catch it. So check it here.
      if (this.isDrawing) {
        return this.sendLastMessage();
      }

      window.addEventListener('mouseup', this.handleMouseUp);
      window.addEventListener('mousemove', this.handleMouseMove, true);

      const { clientX, clientY } = event;
      return this.commonDrawStartHandler(clientX, clientY);
    } else if (event.button === 2) {
      if (!this.isDrawing) {
        this.props.actions.undoAnnotation(this.props.whiteboardId);
      }
    }
    return null;
  }

  // main mouse move handler
  handleMouseMove(event) {
    const { clientX, clientY } = event;
    this.commonDrawMoveHandler(clientX, clientY);
  }

  // main mouse up handler
  handleMouseUp() {
    this.sendLastMessage();
  }

  sendCoordinates() {
    // check the current drawing status
    if (!this.isDrawing) {
      return;
    }
    // check if a current coordinate is not the same as an initial one
    // it prevents us from drawing dots on random clicks
    if (this.currentCoordinate.x === this.initialCoordinate.x &&
        this.currentCoordinate.y === this.initialCoordinate.y) {
      return;
    }

    // check if previously sent coordinate is not equal to a current one
    if (this.currentCoordinate.x === this.lastSentCoordinate.x &&
        this.currentCoordinate.y === this.lastSentCoordinate.y) {
      return;
    }

    const { getCurrentShapeId } = this.props.actions;
    this.handleDrawCommonAnnotation(
      this.initialCoordinate,
      this.currentCoordinate,
      this.currentStatus,
      getCurrentShapeId(),
      this.props.drawSettings.tool,
    );
    this.lastSentCoordinate = this.currentCoordinate;

    if (this.currentStatus === DRAW_START) {
      this.currentStatus = DRAW_UPDATE;
    }
  }

  sendLastMessage() {
    if (this.isDrawing) {
      // make sure we are drawing and we have some coordinates sent for this shape before
      // to prevent sending DRAW_END on a random mouse click
      if (this.lastSentCoordinate.x && this.lastSentCoordinate.y) {
        const { getCurrentShapeId } = this.props.actions;
        this.handleDrawCommonAnnotation(
          this.initialCoordinate,
          this.currentCoordinate,
          DRAW_END,
          getCurrentShapeId(),
          this.props.drawSettings.tool,
        );
      }
      this.resetState();
    }
  }

  resetState() {
    // resetting the current drawing state
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove, true);
    // touchend, touchmove and touchcancel are removed on devices
    window.removeEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.removeEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.removeEventListener('touchcancel', this.handleTouchCancel, true);
    this.isDrawing = false;
    this.currentStatus = undefined;
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

  contextMenuHandler(event) {
    // disable showing context-menu when right click
    event.preventDefault();
    return this;
  }

  render() {
    const { tool } = this.props.drawSettings;
    const baseName = Meteor.settings.public.app.basename;
    const shapeDrawStyle = {
      width: '100%',
      height: '100%',
      touchAction: 'none',
      zIndex: 2 ** 31 - 1, // maximun value of z-index to prevent other things from overlapping
      cursor: `url('${baseName}/resources/images/whiteboard-cursor/${tool !== 'rectangle' ? tool : 'square'}.png'), default`,
    };
    return (
      <div
        onTouchStart={this.handleTouchStart}
        role="presentation"
        style={shapeDrawStyle}
        onMouseDown={this.handleMouseDown}
        onContextMenu={this.contextMenuHandler}
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
