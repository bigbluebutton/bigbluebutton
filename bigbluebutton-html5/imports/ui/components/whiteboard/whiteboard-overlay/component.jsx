import React, { PropTypes } from 'react';
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

    this.getTransformedSvgPoint = this.getTransformedSvgPoint.bind(this);
    this.getSvgPoint = this.getSvgPoint.bind(this);
    this.checkIfOutOfBounds = this.checkIfOutOfBounds.bind(this);
  }

  //a function to transform a screen point to svg point
  //accepts and returns a point of type SvgPoint and an svg object
  coordinateTransform(screenPoint, someSvgObject) {
    var CTM = someSvgObject.getScreenCTM();
    return screenPoint.matrixTransform(CTM.inverse());
  }

  //this function receives an event from the mouse event attached to the window
  //it transforms the coordinate to the main svg coordinate system
  //checks if the point is out of bounds
  //and changes raw coordinates to the percentages relative to the size of the slide
  getTransformedSvgPoint(event) {
    const svggroup = this.props.getSvgRef();
    var svgObject = findDOMNode(svggroup);
    var svgPoint = svgObject.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    let transformedSvgPoint = this.coordinateTransform(svgPoint, svgObject);
    transformedSvgPoint = this.checkIfOutOfBounds({x: transformedSvgPoint.x, y: transformedSvgPoint.y});
    transformedSvgPoint.x = transformedSvgPoint.x / this.props.slideWidth * 100;
    transformedSvgPoint.y = transformedSvgPoint.y / this.props.slideHeight * 100;
    return transformedSvgPoint;
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

    if (x < viewBoxX) {
      x = viewBoxX;
    } else if (x > viewBoxX + viewBoxWidth) {
      x = viewBoxX + viewBoxWidth;
    }

    if (y < viewBoxY) {
      y = viewBoxY;
    } else if (y > viewBoxY + viewBoxHeight) {
      y = viewBoxY + viewBoxHeight;
    }

    return {
      x: x,
      y: y,
    };
  }

  render() {
    let actions = {
      getTransformedSvgPoint: this.getTransformedSvgPoint,
      getSvgPoint: this.getSvgPoint,
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
        <TextDrawListener {...this.props} />
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
