import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from '/imports/startup/client/logger';
import Storage from '/imports/ui/services/storage/session';

const ANNOTATION_CONFIG = Meteor.settings.public.whiteboard.annotations;
const DRAW_START = ANNOTATION_CONFIG.status.start;
const DRAW_UPDATE = ANNOTATION_CONFIG.status.update;
const DRAW_END = ANNOTATION_CONFIG.status.end;
const PALM_REJECTION_MODE = 'palmRejectionMode';

// maximum value of z-index to prevent other things from overlapping
const MAX_Z_INDEX = (2 ** 31) - 1;

export default class ShapePointerListener extends Component {
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
    this.palmRejectionActivated = Storage.getItem(PALM_REJECTION_MODE);

    this.currentStatus = undefined;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);

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

  commonDrawStartHandler(clientX, clientY) {
    this.isDrawing = true;

    const {
      actions,
    } = this.props;

    const {
      getTransformedSvgPoint,
      generateNewShapeId,
      svgCoordinateToPercentages,
    } = actions;

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
      actions,
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

    // saving the last sent coordinate
    this.currentCoordinate = transformedSvgPoint;
    this.sendCoordinates();
  }

  sendCoordinates() {
    const {
      actions,
      drawSettings,
    } = this.props;

    // check the current drawing status
    if (!this.isDrawing) {
      return;
    }
    // check if a current coordinate is not the same as an initial one
    // it prevents us from drawing dots on random clicks
    if (this.currentCoordinate.x === this.initialCoordinate.x
        && this.currentCoordinate.y === this.initialCoordinate.y) {
      return;
    }

    // check if previously sent coordinate is not equal to a current one
    if (this.currentCoordinate.x === this.lastSentCoordinate.x
        && this.currentCoordinate.y === this.lastSentCoordinate.y) {
      return;
    }

    const { getCurrentShapeId } = actions;
    this.handleDrawCommonAnnotation(
      this.initialCoordinate,
      this.currentCoordinate,
      this.currentStatus,
      getCurrentShapeId(),
      drawSettings.tool,
    );
    this.lastSentCoordinate = this.currentCoordinate;

    if (this.currentStatus === DRAW_START) {
      this.currentStatus = DRAW_UPDATE;
    }
  }

  sendLastMessage() {
    const {
      actions,
      drawSettings,
    } = this.props;

    if (this.isDrawing) {
      // make sure we are drawing and we have some coordinates sent for this shape before
      // to prevent sending DRAW_END on a random mouse click
      if (this.lastSentCoordinate.x !== undefined && this.lastSentCoordinate.y !== undefined) {
        const { getCurrentShapeId } = actions;
        this.handleDrawCommonAnnotation(
          this.initialCoordinate,
          this.currentCoordinate,
          DRAW_END,
          getCurrentShapeId(),
          drawSettings.tool,
        );
      }
      this.resetState();
    }
  }

  resetState() {
    // resetting the current drawing state
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
    // remove event handler
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointercancel', this.handlePointerCancel, true);
  }

  // since Rectangle / Triangle / Ellipse / Line have the same coordinate structure
  // we use the same function for all of them
  handleDrawCommonAnnotation(startPoint, endPoint, status, id, shapeType) {
    const {
      whiteboardId,
      userId,
      actions,
      drawSettings,
    } = this.props;

    const {
      normalizeThickness,
      sendAnnotation,
    } = actions;

    const {
      color,
      thickness,
    } = drawSettings;

    const annotation = {
      id,
      status,
      annotationType: shapeType,
      annotationInfo: {
        color,
        thickness: normalizeThickness(thickness),
        points: [
          startPoint.x,
          startPoint.y,
          endPoint.x,
          endPoint.y,
        ],
        id,
        whiteboardId,
        status,
        type: shapeType,
      },
      wbId: whiteboardId,
      userId,
      position: 0,
    };

    sendAnnotation(annotation, whiteboardId);
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

  handlePointerDown(event) {
    this.palmRejectionActivated = Storage.getItem(PALM_REJECTION_MODE);
    switch (event.pointerType) {
      case 'mouse': {
        const isLeftClick = event.button === 0;
        const isRightClick = event.button === 2;

        if (!this.isDrawing) {
          if (isLeftClick) {
            window.addEventListener('pointerup', this.handlePointerUp);
            window.addEventListener('pointermove', this.handlePointerMove);

            const { clientX, clientY } = event;
            this.commonDrawStartHandler(clientX, clientY);
          }

        // if you switch to a different window using Alt+Tab while mouse is down and release it
        // it wont catch mouseUp and will keep tracking the movements. Thus we need this check.
        } else if (isRightClick) {
          this.discardAnnotation();
        }
        break;
      }
      case 'pen': {
        this.touchPenDownHandler(event);
        break;
      }
      case 'touch': {
        if (!this.palmRejectionActivated) {
          this.touchPenDownHandler(event);
        }
        break;
      }
      default: {
        Logger.error({ logCode: 'shape_pointer_listener_unkownPointerTypeError' }, 'PointerType is unknown or could not be detected!');
      }
    }
  }

  // handler for finger touch and pencil touch
  touchPenDownHandler(event) {
    event.preventDefault();
    if (!this.isDrawing) {
      window.addEventListener('pointerup', this.handlePointerUp);
      window.addEventListener('pointermove', this.handlePointerMove);
      window.addEventListener('pointercancel', this.handlePointerCancel, true);

      const { clientX, clientY } = event;
      this.commonDrawStartHandler(clientX, clientY);

      // if you switch to a different window using Alt+Tab while mouse is down and release it
      // it wont catch mouseUp and will keep tracking the movements. Thus we need this check.
    } else {
      this.sendLastMessage();
    }
  }

  handlePointerUp(event) {
    switch (event.pointerType) {
      case 'mouse': {
        this.sendLastMessage();
        break;
      }
      case 'pen': {
        this.sendLastMessage();
        break;
      }
      case 'touch': {
        if (!this.palmRejectionActivated) {
          this.sendLastMessage();
        }
        break;
      }
      default: {
        Logger.error({ logCode: 'shape_pointer_listener_unkownPointerTypeError' }, 'PointerType is unknown or could not be detected!');
      }
    }
  }

  handlePointerMove(event) {
    switch (event.pointerType) {
      case 'mouse': {
        const { clientX, clientY } = event;
        this.commonDrawMoveHandler(clientX, clientY);
        break;
      }
      case 'pen': {
        event.preventDefault();
        const { clientX, clientY } = event;
        this.commonDrawMoveHandler(clientX, clientY);
        break;
      }
      case 'touch': {
        if (!this.palmRejectionActivated) {
          event.preventDefault();
          const { clientX, clientY } = event;
          this.commonDrawMoveHandler(clientX, clientY);
        }
        break;
      }
      default: {
        Logger.error({ logCode: 'shape_pointer_listener_unkownPointerTypeError' }, 'PointerType is unknown or could not be detected!');
      }
    }
  }

  handlePointerCancel(event) {
    switch (event.pointerType) {
      case 'pen': {
        this.sendLastMessage();
        break;
      }
      case 'touch': {
        if (!this.palmRejectionActivated) {
          this.sendLastMessage();
        }
        break;
      }
      default: {
        Logger.error({ logCode: 'shape_pointer_listener_unkownPointerTypeError' }, 'PointerType is unknown or could not be detected!');
      }
    }
  }

  render() {
    const {
      actions,
      drawSettings,
    } = this.props;

    const {
      contextMenuHandler,
    } = actions;

    const {
      tool,
    } = drawSettings;

    const baseName = Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename;
    const shapeDrawStyle = {
      width: '100%',
      height: '100%',
      touchAction: 'none',
      zIndex: MAX_Z_INDEX,
      cursor: `url('${baseName}/resources/images/whiteboard-cursor/${tool !== 'rectangle' ? tool : 'square'}.png'), default`,
    };

    return (
      <div
        onPointerDown={this.handlePointerDown}
        role="presentation"
        style={shapeDrawStyle}
        onContextMenu={contextMenuHandler}
      />
    );
  }
}

ShapePointerListener.propTypes = {
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
    tool: PropTypes.string,
  }).isRequired,
};
