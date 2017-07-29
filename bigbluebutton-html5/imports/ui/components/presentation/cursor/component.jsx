import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

export default class Cursor extends Component {

  static calculatePositionAndRadius(propsObj) {
    const { cursorX, cursorY, slideWidth, slideHeight,
        physicalWidthRatio, radius, widthRatio, fill } = propsObj;

    return {
      // Adjust the x,y cursor position according to zoom
      cx: (cursorX / 100) * slideWidth,
      cy: (cursorY / 100) * slideHeight,
      // Adjust the radius of the cursor according to zoom
      // and divide it by the physicalWidth ratio, so that svg scaling wasn't applied to the cursor
      finalRadius: ((radius * widthRatio) / 100) / physicalWidthRatio,
      fill,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      prevData: undefined,
      currentData: undefined,
      defaultRadius: 5,
    };
  }

  componentWillMount() {
    const calculatedData = Cursor.calculatePositionAndRadius(this.props);
    this.setState({
      currentData: calculatedData,
      prevData: calculatedData,
      defaultRadius: calculatedData.finalRadius,
    });
  }

  componentWillReceiveProps(nextProps) {
    const calculatedData = Cursor.calculatePositionAndRadius(nextProps);
    this.setState({
      prevData: this.state.currentData,
      currentData: calculatedData,
    });
  }

  componentDidUpdate() {
    const node1 = findDOMNode(this.cursorCoordinatesRef);
    const node2 = findDOMNode(this.cursorRadiusRef);
    node1.beginElement();
    node2.beginElement();
  }

  render() {
    const {
      currentData,
      prevData,
    } = this.state;

    return (
      <circle
        r={this.state.defaultRadius}
        fill={currentData.fill}
      >
        <animateTransform
          ref={(ref) => { this.cursorCoordinatesRef = ref; }}
          attributeName="transform"
          type="translate"
          from={`${prevData.cx} ${prevData.cy}`}
          to={`${currentData.cx} ${currentData.cy}`}
          begin={'indefinite'}
          dur="0.1s"
          repeatCount="0"
          fill="freeze"
        />
        <animate
          ref={(ref) => { this.cursorRadiusRef = ref; }}
          attributeName="r"
          attributeType="XML"
          from={prevData.finalRadius}
          to={currentData.finalRadius}
          begin={'indefinite'}
          dur="0.2s"
          repeatCount="0"
          fill="freeze"
        />
      </circle>
    );
  }
}

Cursor.propTypes = {
  // ESLint can't detect where all these propTypes are used, and they are not planning to fix it
  // so the next line disables eslint's no-unused-prop-types rule for this file.
  /* eslint-disable react/no-unused-prop-types */

  // Defines the cursor x position
  cursorX: PropTypes.number.isRequired,

  // Defines the cursor y position
  cursorY: PropTypes.number.isRequired,

  // Slide to view box width ratio
  widthRatio: PropTypes.number.isRequired,

  // Slide physical size to original size ratio
  physicalWidthRatio: PropTypes.number.isRequired,

  /**
   * Defines the cursor fill colour
   * @defaultValue 'red'
   */
  fill: PropTypes.string,

  /**
   * Defines the cursor radius
   * @defaultValue 5
   */
  radius: PropTypes.number,
};

Cursor.defaultProps = {
  fill: 'red',
  radius: 5,
};
