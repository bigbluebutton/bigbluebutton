import React, { Component } from 'react';
import { throttle } from 'lodash';
import PropTypes from 'prop-types';

// maximum value of z-index to prevent other things from overlapping
const MAX_Z_INDEX = (2 ** 31) - 1;
const CURSOR_INTERVAL = 40;

export default class CursorListener extends Component {
  static touchCenterPoint(touches) {
    let totalX = 0;
    let totalY = 0;

    for (let i = 0; i < touches.length; i += 1) {
      totalX += touches[i].clientX;
      totalY += touches[i].clientY;
    }

    return { x: totalX / touches.length, y: totalY / touches.length };
  }

  constructor(props) {
    super(props);

    // Mobile Firefox has a bug where e.preventDefault on touchstart doesn't prevent
    // onmousedown from triggering right after. Thus we have to track it manually.
    // In case if it's fixed one day - there is another issue, React one.
    // https://github.com/facebook/react/issues/9809
    // Check it to figure if you can add onTouchStart in render(), or should use raw DOM api
    this.touchStarted = false;

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);

    this.checkCursor = throttle(this.checkCursor, CURSOR_INTERVAL);
  }

  componentWillUnmount() {
    this.removeTouchListeners();
    this.checkCursor(-1, -1);
  }

  checkCursor(mouseX, mouseY) {
    const {
      actions,
      updateCursor,
      whiteboardId,
    } = this.props;

    // check if the cursor hasn't moved since last check
    if (this.lastSentClientX !== mouseX
      || this.lastSentClientY !== mouseY) {
      // retrieving a transformed coordinate
      let transformedSvgPoint = actions.getTransformedSvgPoint(mouseX, mouseY);

      // determining the cursor's coordinates as percentages from the slide's width/height
      transformedSvgPoint = actions.svgCoordinateToPercentages(transformedSvgPoint);
      // updating last sent raw coordinates
      this.lastSentClientX = mouseX;
      this.lastSentClientY = mouseY;
      this.lastSentXPercent = transformedSvgPoint.x;
      this.lastSentYPercent = transformedSvgPoint.y;

      // sending the update to the server
      updateCursor({
        xPercent: transformedSvgPoint.x,
        yPercent: transformedSvgPoint.y,
        whiteboardId,
      });
    }
  }

  checkLastCursor() {
    const {
      actions,
      updateCursor,
      whiteboardId,
    } = this.props;

    if (this.lastSentClientX && this.lastSentClientY) {
      let transformedSvgPoint = actions.getTransformedSvgPoint(
        this.lastSentClientX, this.lastSentClientY,
      );

      // determining the cursor's coordinates as percentages from the slide's width/height
      transformedSvgPoint = actions.svgCoordinateToPercentages(transformedSvgPoint);

      if (this.lastSentXPercent !== transformedSvgPoint.x
        && this.lastSentYPercent !== transformedSvgPoint) {
        // sending the update to the server
        updateCursor({
          xPercent: transformedSvgPoint.x,
          yPercent: transformedSvgPoint.y,
          whiteboardId,
        });
      }
    }
  }

  removeTouchListeners() {
    window.removeEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.removeEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.removeEventListener('touchcancel', this.handleTouchCancel, true);
  }

  handleMouseEnter(event) {
    if (this.touchStarted) {
      return;
    }

    this.checkCursor(event.clientX, event.clientY);
  }

  handleMouseMove(event) {
    if (this.touchStarted) {
      return;
    }

    this.checkCursor(event.clientX, event.clientY);
  }

  handleMouseLeave() {
    this.checkCursor(-1, -1);
  }

  clearTouchEvents() {
    this.removeTouchListeners();
    this.touchStarted = false;
    this.checkCursor(-1, -1);
  }

  handleTouchStart(event) {
    event.preventDefault();

    window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', this.handleTouchCancel, true);

    this.touchStarted = true;

    const midPoint = CursorListener.touchCenterPoint(event.touches);

    this.checkCursor(midPoint.x, midPoint.y);
  }

  handleTouchMove(event) {
    event.preventDefault();

    const midPoint = CursorListener.touchCenterPoint(event.touches);

    this.checkCursor(midPoint.x, midPoint.y);
  }

  handleTouchEnd(event) {
    event.preventDefault();

    this.clearTouchEvents();
  }

  handleTouchCancel(event) {
    event.preventDefault();

    if (event.touches.length === 0) {
      this.clearTouchEvents();
    }
  }

  render() {
    const {
      children,
    } = this.props;

    this.checkLastCursor();

    const cursorStyle = {
      width: '100%',
      height: '100%',
      touchAction: 'none',
      zIndex: MAX_Z_INDEX,
    };

    return (
      <div
        style={cursorStyle}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
        onTouchStart={this.handleTouchStart}
      >
        {children}
      </div>
    );
  }
}

CursorListener.propTypes = {
  // Defines a whiteboard id, which needed to publish an annotation message
  whiteboardId: PropTypes.string.isRequired,
  // Defines a function to send the new cursor location
  updateCursor: PropTypes.func.isRequired,
  // Defines an object containing all available actions
  actions: PropTypes.shape({
    // Defines a function which transforms a coordinate from the window to svg coordinate system
    getTransformedSvgPoint: PropTypes.func.isRequired,
    // Defines a function which receives an svg point and transforms it into
    // percentage-based coordinates
    svgCoordinateToPercentages: PropTypes.func.isRequired,
  }).isRequired,
  // Expected to be any required draw listeners
  children: PropTypes.element.isRequired,
};
