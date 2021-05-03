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
const POINTS_TO_BUFFER = 2;

export default class PencilPointerListener extends Component {
  constructor() {
    super();

    // to track the status of drawing
    this.isDrawing = false;
    this.palmRejectionActivated = Storage.getItem(PALM_REJECTION_MODE);
    this.points = [];

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);

    this.resetState = this.resetState.bind(this);
    this.sendLastMessage = this.sendLastMessage.bind(this);
    this.sendCoordinates = this.sendCoordinates.bind(this);
    this.discardAnnotation = this.discardAnnotation.bind(this);
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
    const {
      actions,
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
    this.handleDrawPencil(this.points, DRAW_START, generateNewShapeId());
  }

  commonDrawMoveHandler(clientX, clientY) {
    if (this.isDrawing) {
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

      // saving the coordinate to the array
      this.points.push(transformedSvgPoint.x);
      this.points.push(transformedSvgPoint.y);

      if (this.points.length > POINTS_TO_BUFFER) {
        this.sendCoordinates();
      }
    }
  }

  sendCoordinates() {
    if (this.isDrawing && this.points.length > 0) {
      const {
        actions,
      } = this.props;

      const { getCurrentShapeId } = actions;
      this.handleDrawPencil(this.points, DRAW_UPDATE, getCurrentShapeId());
    }
  }

  handleDrawPencil(points, status, id, dimensions) {
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
      thickness,
      color,
    } = drawSettings;

    const annotation = {
      id,
      status,
      annotationType: 'pencil',
      annotationInfo: {
        color,
        thickness: normalizeThickness(thickness),
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

    sendAnnotation(annotation, whiteboardId);
  }

  sendLastMessage() {
    if (this.isDrawing) {
      const {
        physicalSlideWidth,
        physicalSlideHeight,
        actions,
      } = this.props;

      const { getCurrentShapeId } = actions;

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
    // remove event listener
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointercancel', this.handlePointerCancel, true);
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
        Logger.error({ logCode: 'pencil_pointer_listener_unkownPointerTypeError' }, 'PointerType is unknown or could not be detected!');
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
        Logger.error({ logCode: 'pencil_pointer_listener_unkownPointerTypeError' }, 'PointerType is unknown or could not be detected!');
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
        Logger.error({ logCode: 'pencil_pointer_listener_unkownPointerTypeError' }, 'PointerType is unknown or could not be detected!');
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
        Logger.error({ logCode: 'pencil_pointer_listener_unkownPointerTypeError' }, 'PointerType is unknown or could not be detected!');
      }
    }
  }

  render() {
    const {
      actions,
    } = this.props;

    const { contextMenuHandler } = actions;

    const baseName = Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename;
    const pencilDrawStyle = {
      width: '100%',
      height: '100%',
      touchAction: 'none',
      zIndex: MAX_Z_INDEX,
      cursor: `url('${baseName}/resources/images/whiteboard-cursor/pencil.png') 2 22, default`,
    };

    return (
      <div
        onPointerDown={this.handlePointerDown}
        role="presentation"
        style={pencilDrawStyle}
        onContextMenu={contextMenuHandler}
      />
    );
  }
}

PencilPointerListener.propTypes = {
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
  // Defines if palm rejection is active or not
  // palmRejection: PropTypes.bool.isRequired,
};
