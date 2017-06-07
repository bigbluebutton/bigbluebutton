import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';
import ShapeDrawListener from './shape-draw-listener/component';
import TextDrawListener from './text-draw-listener/component';
import PencilDrawListener from './pencil-draw-listener/component';
import PanZoomDrawListener from './pan-zoom-draw-listener/component';

export default class WhiteboardOverlay extends React.Component {
  constructor(props) {
    super(props);

    //current shape id
    this.currentShapeId = undefined;

    //count, used to generate a new shape id
    this.count = 0;

    this.getCurrentShapeId = this.getCurrentShapeId.bind(this);
    this.generateNewShapeId = this.generateNewShapeId.bind(this);
    this.getTransformedSvgPoint = this.getTransformedSvgPoint.bind(this);
    this.getSvgPoint = this.getSvgPoint.bind(this);
    this.checkIfOutOfBounds = this.checkIfOutOfBounds.bind(this);
    this.svgCoordinateToPercentages = this.svgCoordinateToPercentages.bind(this);
  }


  getCurrentShapeId() {
    return this.currentShapeId;
  }

  generateNewShapeId() {
    this.count = this.count + 1;
    this.currentShapeId = this.count + "-" + new Date().getTime();
    return this.currentShapeId;
  }

  //a function to transform a screen point to svg point
  //accepts and returns a point of type SvgPoint and an svg object
  coordinateTransform(screenPoint, someSvgObject) {
    var CTM = someSvgObject.getScreenCTM();
    return screenPoint.matrixTransform(CTM.inverse());
  }

  //this function receives an event from the mouse event attached to the window
  //it transforms the coordinate to the main svg coordinate system
  getTransformedSvgPoint(event) {
    const svggroup = this.props.getSvgRef();
    var svgObject = findDOMNode(svggroup);
    var svgPoint = svgObject.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    let transformedSvgPoint = this.coordinateTransform(svgPoint, svgObject);

    return transformedSvgPoint;
  }

  //receives an svg coordinate and changes the values to percentages of the slide's width/height
  svgCoordinateToPercentages(svgPoint) {
    svgPoint.x = svgPoint.x / this.props.slideWidth * 100;
    svgPoint.y = svgPoint.y / this.props.slideHeight * 100;
    return svgPoint;
  }

  //this function receives an event attached to the svg, not to the window
  //so we just transform raw coordinates to percentage based coordinates
  getSvgPoint(event) {
    let x = event.nativeEvent.offsetX / this.props.slideWidth * 100;
    let y = event.nativeEvent.offsetY / this.props.slideHeight * 100;

    return { x, y };
  }

  //this function receives a transformed svg coordinate and checks if it's not out of bounds
  checkIfOutOfBounds(point) {
    const { viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight } = this.props;

    let x = point.x;
    let y = point.y;

    //set this flag to true if either x or y are out of bounds
    let shouldUnFocus = false;

    if (x < viewBoxX) {
      x = viewBoxX;
      shouldUnFocus = true;
    } else if (x > viewBoxX + viewBoxWidth) {
      x = viewBoxX + viewBoxWidth;
      shouldUnFocus = true;
    }

    if (y < viewBoxY) {
      y = viewBoxY;
      shouldUnFocus = true;
    } else if (y > viewBoxY + viewBoxHeight) {
      y = viewBoxY + viewBoxHeight;
      shouldUnFocus = true;
    }

    //if either x or y are out of bounds - remove focus from potentially selected elements
    if(shouldUnFocus) {
      this.unFocus();
    }

    return {
      x: x,
      y: y,
    };
  }

  unFocus() {
    if (document.selection) {
      document.selection.empty()
    } else {
      window.getSelection().removeAllRanges()
    }
  }

  render() {
    let actions = {
      getTransformedSvgPoint: this.getTransformedSvgPoint,
      getSvgPoint: this.getSvgPoint,
      checkIfOutOfBounds: this.checkIfOutOfBounds,
      svgCoordinateToPercentages: this.svgCoordinateToPercentages,
      getCurrentShapeId: this.getCurrentShapeId,
      generateNewShapeId: this.generateNewShapeId,
    };

    let tool = this.props.drawSettings.tool;
    if (tool == "Triangle" || tool == "Rectangle" || tool == "Ellipse" || tool == "Line") {
      return (
        <ShapeDrawListener {...this.props} actions={actions}/>
      );
    } else if (tool == "Pencil") {
      return (
        <PencilDrawListener {...this.props} actions={actions}/>
      );
    } else if (tool == "Text") {
      return (
        <TextDrawListener {...this.props} actions={actions}/>
      );
    } else if (tool == "Hand") {
      return (
        <PanZoomDrawListener {...this.props} />
      );
    } else {
      return (
        <span></span>
      );
    }
  }
}
