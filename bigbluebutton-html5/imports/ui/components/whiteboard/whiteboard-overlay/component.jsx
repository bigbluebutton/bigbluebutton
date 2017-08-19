import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ShapeDrawListener from './shape-draw-listener/component';
import TextDrawListener from './text-draw-listener/component';
import PencilDrawListener from './pencil-draw-listener/component';
import PanZoomDrawListener from './pan-zoom-draw-listener/component';

export default class WhiteboardOverlay extends Component {

  // a function to transform a screen point to svg point
  // accepts and returns a point of type SvgPoint and an svg object
  static coordinateTransform(screenPoint, someSvgObject) {
    const CTM = someSvgObject.getScreenCTM();
    return screenPoint.matrixTransform(CTM.inverse());
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
    this.getSvgPoint = this.getSvgPoint.bind(this);
    this.checkIfOutOfBounds = this.checkIfOutOfBounds.bind(this);
    this.svgCoordinateToPercentages = this.svgCoordinateToPercentages.bind(this);
    this.normalizeThickness = this.normalizeThickness.bind(this);
  }


  getCurrentShapeId() {
    return this.currentShapeId;
  }

  // this function receives an event from the mouse event attached to the window
  // it transforms the coordinate to the main svg coordinate system
  getTransformedSvgPoint(event) {
    const svgObject = this.props.getSvgRef();
    const svgPoint = svgObject.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    const transformedSvgPoint = WhiteboardOverlay.coordinateTransform(svgPoint, svgObject);

    return transformedSvgPoint;
  }

  // this function receives an event attached to the svg, not to the window
  // so we just transform raw coordinates to percentage based coordinates
  getSvgPoint(event) {
    const x = (event.nativeEvent.offsetX / this.props.slideWidth) * 100;
    const y = (event.nativeEvent.offsetY / this.props.slideHeight) * 100;

    return { x, y };
  }

  // receives an svg coordinate and changes the values to percentages of the slide's width/height
  svgCoordinateToPercentages(svgPoint) {
    const point = {
      x: (svgPoint.x / this.props.slideWidth) * 100,
      y: (svgPoint.y / this.props.slideHeight) * 100,
    };

    return point;
  }

  normalizeThickness(thickness) {
    return (thickness * 100) / this.props.physicalViewBoxWidth;
  }

  generateNewShapeId() {
    this.count = this.count + 1;
    this.currentShapeId = `${this.props.userId}-${this.count}-${new Date().getTime()}`;
    return this.currentShapeId;
  }

  // this function receives a transformed svg coordinate and checks if it's not out of bounds
  checkIfOutOfBounds(point) {
    const { viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight } = this.props;

    let x = point.x;
    let y = point.y;

    // set this flag to true if either x or y are out of bounds
    let shouldUnSelect = false;

    if (x < viewBoxX) {
      x = viewBoxX;
      shouldUnSelect = true;
    } else if (x > viewBoxX + viewBoxWidth) {
      x = viewBoxX + viewBoxWidth;
      shouldUnSelect = true;
    }

    if (y < viewBoxY) {
      y = viewBoxY;
      shouldUnSelect = true;
    } else if (y > viewBoxY + viewBoxHeight) {
      y = viewBoxY + viewBoxHeight;
      shouldUnSelect = true;
    }

    // if either x or y are out of bounds - remove selection from potentially selected elements
    if (shouldUnSelect) {
      WhiteboardOverlay.unSelect();
    }

    return {
      x,
      y,
    };
  }

  render() {
    const { drawSettings, userId, sendAnnotation, whiteboardId } = this.props;
    const { tool } = drawSettings;
    const actions = {
      getTransformedSvgPoint: this.getTransformedSvgPoint,
      getSvgPoint: this.getSvgPoint,
      checkIfOutOfBounds: this.checkIfOutOfBounds,
      svgCoordinateToPercentages: this.svgCoordinateToPercentages,
      getCurrentShapeId: this.getCurrentShapeId,
      generateNewShapeId: this.generateNewShapeId,
      normalizeThickness: this.normalizeThickness,
      sendAnnotation,
    };

    if (tool === 'triangle' || tool === 'rectangle' || tool === 'ellipse' || tool === 'line') {
      return (
        <ShapeDrawListener
          userId={userId}
          actions={actions}
          drawSettings={drawSettings}
          whiteboardId={whiteboardId}
        />
      );
    } else if (tool === 'pencil') {
      return (
        <PencilDrawListener {...this.props} actions={actions} />
      );
    } else if (tool === 'text') {
      return (
        <TextDrawListener {...this.props} actions={actions} />
      );
    } else if (tool === 'hand') {
      return (
        <PanZoomDrawListener {...this.props} />
      );
    }
    return (
      <span />
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
  // Defines the physical width of the viewBox, in order to calculate thickness
  physicalViewBoxWidth: PropTypes.number.isRequired,
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
    tool: PropTypes.string.isRequired,
    // Font size for the text shape
    textFontSize: PropTypes.number.isRequired,
    // Text shape value
    textShapeValue: PropTypes.string.isRequired,
  }).isRequired,
};
