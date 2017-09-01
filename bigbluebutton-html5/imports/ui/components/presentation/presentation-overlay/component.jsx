import React, { Component } from 'react';
import PropTypes from 'prop-types';

const CURSOR_INTERVAL = 50;

export default class PresentationOverlay extends Component {
  constructor(props) {
    super(props);

    // last sent coordinates
    this.lastSentClientX = 0;
    this.lastSentClientY = 0;

    // last updated coordinates
    this.currentClientX = 0;
    this.currentClientY = 0;

    // id of the setInterval()
    this.intervalId = 0;

    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.checkCursor = this.checkCursor.bind(this);
    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseOutHandler = this.mouseOutHandler.bind(this);
    this.getTransformedSvgPoint = this.getTransformedSvgPoint.bind(this);
    this.svgCoordinateToPercentages = this.svgCoordinateToPercentages.bind(this);
  }

  // transforms the coordinate from window coordinate system
  // to the main svg coordinate system
  getTransformedSvgPoint(clientX, clientY) {
    const svgObject = this.props.getSvgRef();
    const screenPoint = svgObject.createSVGPoint();
    screenPoint.x = clientX;
    screenPoint.y = clientY;

    // transform a screen point to svg point
    const CTM = svgObject.getScreenCTM();
    return screenPoint.matrixTransform(CTM.inverse());
  }

  checkCursor() {
    // check if the cursor hasn't moved since last check
    if (this.lastSentClientX !== this.currentClientX
      || this.lastSentClientY !== this.currentClientY) {
      const { currentClientX, currentClientY } = this;
      // retrieving a transformed coordinate
      let transformedSvgPoint = this.getTransformedSvgPoint(currentClientX, currentClientY);
      // determining the cursor's coordinates as percentages from the slide's width/height
      transformedSvgPoint = this.svgCoordinateToPercentages(transformedSvgPoint);
      // updating last sent raw coordinates
      this.lastSentClientX = currentClientX;
      this.lastSentClientY = currentClientY;

      // sending the update to the server
      this.props.updateCursor({ xPercent: transformedSvgPoint.x, yPercent: transformedSvgPoint.y });
    }
  }

  // receives an svg coordinate and changes the values to percentages of the slide's width/height
  svgCoordinateToPercentages(svgPoint) {
    const point = {
      x: (svgPoint.x / this.props.slideWidth) * 100,
      y: (svgPoint.y / this.props.slideHeight) * 100,
    };

    return point;
  }

  mouseMoveHandler(event) {
    // for the case where you change settings in one of the lists (which are displayed on the slide)
    // the mouse starts pointing to the slide right away and mouseEnter doesn't fire
    // so we call it manually here
    if (!this.intervalId) {
      this.mouseEnterHandler();
    }

    this.currentClientX = event.nativeEvent.clientX;
    this.currentClientY = event.nativeEvent.clientY;
  }

  mouseEnterHandler() {
    const intervalId = setInterval(this.checkCursor, CURSOR_INTERVAL);
    this.intervalId = intervalId;
  }

  mouseOutHandler() {
    // mouse left the whiteboard, removing the interval
    clearInterval(this.intervalId);
    this.intervalId = 0;

    // setting the coords to negative values and send the last message (the cursor will disappear)
    this.currentClientX = -1;
    this.currentClientY = -1;
    this.checkCursor();
  }

  render() {
    return (
      <foreignObject
        clipPath="url(#viewBox)"
        x="0"
        y="0"
        width={this.props.slideWidth}
        height={this.props.slideHeight}
      >
        <div
          onMouseOut={this.mouseOutHandler}
          onMouseEnter={this.mouseEnterHandler}
          onMouseMove={this.mouseMoveHandler}
          style={{ width: '100%', height: '100%' }}
        >
          {this.props.children}
        </div>
      </foreignObject>
    );
  }
}

PresentationOverlay.propTypes = {
  // Defines a function which returns a reference to the main svg object
  getSvgRef: PropTypes.func.isRequired,

  // Defines the calculated slide width (in svg coordinate system)
  slideWidth: PropTypes.number.isRequired,

  // Defines the calculated slide height (in svg coordinate system)
  slideHeight: PropTypes.number.isRequired,

  // A function to send a cursor update
  updateCursor: PropTypes.func.isRequired,

  // As a child we expect only a WhiteboardOverlay at this point
  children: PropTypes.element.isRequired,
};
