import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

const propTypes = {
  //Width of the view box
  viewBoxWidth: PropTypes.number.isRequired,

  //Height of the view box
  viewBoxHeight: PropTypes.number.isRequired,

  //x Position of the view box
  viewBoxX: PropTypes.number.isRequired,

  //y Position of the view box
  viewBoxY: PropTypes.number.isRequired,

  //Defines the cursor x position
  cursorX: PropTypes.number.isRequired,

  //Defines the cursor y position
  cursorY: PropTypes.number.isRequired,

  //Slide to view box width ratio
  widthRatio: PropTypes.number.isRequired,

  //Slide physical size to original size ratio
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

const defaultProps = {
  fill: 'red',
  radius: 5,
};

export default class Cursor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prevData: undefined,
      currentData: undefined,
      defaultRadius: 5,
    };
  }

  componentWillMount() {
    let calculatedData = this.calculatePositionAndRadius(this.props);
    this.setState({
      currentData: calculatedData,
      prevData: calculatedData,
      defaultRadius: calculatedData.finalRadius,
    });
  }

  componentWillReceiveProps(nextProps) {
    let calculatedData = this.calculatePositionAndRadius(nextProps);
    this.setState({
      prevData: this.state.currentData,
      currentData: calculatedData,
    });
  }

  componentDidUpdate() {
    const { cursorCoordinates, cursorRadius } = this.refs;
    var node1 = findDOMNode(cursorCoordinates);
    var node2 = findDOMNode(cursorRadius);
    node1.beginElement();
    node2.beginElement();
  }

  calculatePositionAndRadius(propsObj) {
    return {
      //Adjust the x,y cursor position according to zoom
      cx: (propsObj.cursorX * propsObj.viewBoxWidth) + propsObj.viewBoxX,
      cy: (propsObj.cursorY * propsObj.viewBoxHeight) + propsObj.viewBoxY,
      //Adjust the radius of the cursor according to zoom
      //and divide it by the physicalWidth ratio, so that svg scaling wasn't applied to the cursor
      finalRadius: (propsObj.radius * propsObj.widthRatio / 100) / this.props.physicalWidthRatio,
      fill: propsObj.fill,
    }
  }

  render() {
    const {
      currentData,
      prevData
    } = this.state;

    return (
      <circle
        r={this.state.defaultRadius}
        fill={currentData.fill}
      >
        <animateTransform
          ref="cursorCoordinates"
          attributeName="transform"
          type="translate"
          from={prevData.cx + " " + prevData.cy}
          to={currentData.cx + " " + currentData.cy}
          begin={'indefinite'}
          dur="0.1s"
          repeatCount="0"
          fill="freeze"
        />
        <animate
          ref="cursorRadius"
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

Cursor.propTypes = propTypes;
Cursor.defaultProps = defaultProps;
