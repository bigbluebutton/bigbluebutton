import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ShapeDrawListener from './shape-draw-listener/component';
import TextDrawListener from './text-draw-listener/component';
import PencilDrawListener from './pencil-draw-listener/component';
import CursorListener from './cursor-listener/component';

export default class WhiteboardOverlay extends Component {
  // a function to transform a screen point to svg point
  // accepts and returns a point of type SvgPoint and an svg object
  // if unable to get the screen CTM, returns an out
  // of bounds (-1, -1) svg point
  static coordinateTransform(screenPoint, someSvgObject) {
    const CTM = someSvgObject.getScreenCTM();
    if (CTM !== null) {
      return screenPoint.matrixTransform(CTM.inverse());
    }

    const outOfBounds = someSvgObject.createSVGPoint();
    outOfBounds.x = -1;
    outOfBounds.y = -1;

    return outOfBounds;
  }

  // Removes selection from all selected elements
  static unSelect() {
    if (document.selection) {
      document.selection.empty();
    } else {
      window.getSelection().removeAllRanges();
    }
  }

  constructor(props) {
    super(props);

    // current shape id
    this.currentShapeId = undefined;

    // count, used to generate a new shape id
    this.count = 0;

    this.getCurrentShapeId = this.getCurrentShapeId.bind(this);
    this.generateNewShapeId = this.generateNewShapeId.bind(this);
    this.getTransformedSvgPoint = this.getTransformedSvgPoint.bind(this);
    this.checkIfOutOfBounds = this.checkIfOutOfBounds.bind(this);
    this.svgCoordinateToPercentages = this.svgCoordinateToPercentages.bind(this);
    this.normalizeThickness = this.normalizeThickness.bind(this);
    this.normalizeFont = this.normalizeFont.bind(this);
  }


  getCurrentShapeId() {
    return this.currentShapeId;
  }

  // this function receives an event from the mouse event attached to the window
  // it transforms the coordinate to the main svg coordinate system
  getTransformedSvgPoint(clientX, clientY) {
    const {
      getSvgRef,
    } = this.props;

    const svgObject = getSvgRef();
    const svgPoint = svgObject.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = clientY;
    const transformedSvgPoint = WhiteboardOverlay.coordinateTransform(svgPoint, svgObject);

    return transformedSvgPoint;
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

  normalizeThickness(thickness) {
    const {
      physicalSlideWidth,
    } = this.props;

    return (thickness * 100) / physicalSlideWidth;
  }

  normalizeFont(fontSize) {
    const {
      physicalSlideHeight,
    } = this.props;

    return (fontSize * 100) / physicalSlideHeight;
  }

  generateNewShapeId() {
    const {
      userId,
    } = this.props;

    this.count = this.count + 1;
    this.currentShapeId = `${userId}-${this.count}-${new Date().getTime()}`;
    return this.currentShapeId;
  }

  // this function receives a transformed svg coordinate and checks if it's not out of bounds
  checkIfOutOfBounds(point) {
    const {
      viewBoxX,
      viewBoxY,
      viewBoxWidth,
      viewBoxHeight,
    } = this.props;

    let { x, y } = point;

    // set this flag to true if either x or y are out of bounds
    let shouldUnselect = false;

    if (x < viewBoxX) {
      x = viewBoxX;
      shouldUnselect = true;
    } else if (x > viewBoxX + viewBoxWidth) {
      x = viewBoxX + viewBoxWidth;
      shouldUnselect = true;
    }

    if (y < viewBoxY) {
      y = viewBoxY;
      shouldUnselect = true;
    } else if (y > viewBoxY + viewBoxHeight) {
      y = viewBoxY + viewBoxHeight;
      shouldUnselect = true;
    }

    // if either x or y are out of bounds - remove selection from potentially selected elements
    if (shouldUnselect) {
      WhiteboardOverlay.unSelect();
    }

    return {
      x,
      y,
    };
  }

  renderDrawListener(actions) {
    const {
      drawSettings,
      userId,
      whiteboardId,
      physicalSlideWidth,
      physicalSlideHeight,
      slideWidth,
      slideHeight,
    } = this.props;

    const { tool } = drawSettings;

    if (tool === 'triangle' || tool === 'rectangle' || tool === 'ellipse' || tool === 'line') {
      return (
        <ShapeDrawListener
          userId={userId}
          actions={actions}
          drawSettings={drawSettings}
          whiteboardId={whiteboardId}
        />
      );
    } if (tool === 'pencil') {
      return (
        <PencilDrawListener
          userId={userId}
          whiteboardId={whiteboardId}
          drawSettings={drawSettings}
          actions={actions}
          physicalSlideWidth={physicalSlideWidth}
          physicalSlideHeight={physicalSlideHeight}
        />
      );
    } if (tool === 'text') {
      return (
        <TextDrawListener
          userId={userId}
          whiteboardId={whiteboardId}
          drawSettings={drawSettings}
          actions={actions}
          slideWidth={slideWidth}
          slideHeight={slideHeight}
        />
      );
    }
    return (
      <span />
    );
  }

  render() {
    const {
      whiteboardId,
      sendAnnotation,
      resetTextShapeSession,
      setTextShapeActiveId,
      contextMenuHandler,
      addAnnotationToDiscardedList,
      undoAnnotation,
      updateCursor,
    } = this.props;

    const actions = {
      getTransformedSvgPoint: this.getTransformedSvgPoint,
      checkIfOutOfBounds: this.checkIfOutOfBounds,
      svgCoordinateToPercentages: this.svgCoordinateToPercentages,
      getCurrentShapeId: this.getCurrentShapeId,
      generateNewShapeId: this.generateNewShapeId,
      normalizeThickness: this.normalizeThickness,
      normalizeFont: this.normalizeFont,
      sendAnnotation,
      resetTextShapeSession,
      setTextShapeActiveId,
      contextMenuHandler,
      addAnnotationToDiscardedList,
      undoAnnotation,
    };

    return (
      <CursorListener
        whiteboardId={whiteboardId}
        actions={actions}
        updateCursor={updateCursor}
      >
        {this.renderDrawListener(actions)}
      </CursorListener>
    );
  }
}

WhiteboardOverlay.propTypes = {
  // Defines a function which returns a reference to the main svg object
  getSvgRef: PropTypes.func.isRequired,
  // Defines the width of the slide (svg coordinate system)
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system)
  slideHeight: PropTypes.number.isRequired,
  // Defines the physical width of the slide, needed to calculate thickness, and pencil smoothing
  physicalSlideWidth: PropTypes.number.isRequired,
  // Defines the physical width of the slide, to calculate pencil smoothing
  physicalSlideHeight: PropTypes.number.isRequired,
  // Defines a current user's user id
  userId: PropTypes.string.isRequired,
  // Defines an X coordinate of the viewBox
  viewBoxX: PropTypes.number.isRequired,
  // Defines a Y coordinate of the viewBox
  viewBoxY: PropTypes.number.isRequired,
  // Defines a width of the viewBox
  viewBoxWidth: PropTypes.number.isRequired,
  // Defines a height of the viewBox
  viewBoxHeight: PropTypes.number.isRequired,
  // Defines a handler to publish an annotation to the server
  sendAnnotation: PropTypes.func.isRequired,
  // Defines a current whiteboard id
  whiteboardId: PropTypes.string.isRequired,
  // Defines an object containing current settings for drawing
  drawSettings: PropTypes.shape({
    // Annotation color
    color: PropTypes.number.isRequired,
    // Annotation thickness (not normalized)
    thickness: PropTypes.number.isRequired,
    // The name of the tool currently selected
    tool: PropTypes.string,
    // Font size for the text shape
    textFontSize: PropTypes.number.isRequired,
    // Text shape value
    textShapeValue: PropTypes.string.isRequired,
  }).isRequired,
  // Defines a function which resets the current state of the text shape drawing
  resetTextShapeSession: PropTypes.func.isRequired,
  // Defines a function that sets a session value for the current active text shape
  setTextShapeActiveId: PropTypes.func.isRequired,
  // Defines a handler to publish cursor position to the server
  updateCursor: PropTypes.func.isRequired,
};
