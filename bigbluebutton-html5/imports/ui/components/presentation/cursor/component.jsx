import React, { Component } from 'react';
import PropTypes from 'prop-types';

const CURSOR_MOVEMENT_ANIMATION_INTERVAL = '0.05s';

export default class Cursor extends Component {


  static scale(attribute, propsObj) {
    const { widthRatio, physicalWidthRatio } = propsObj;
    return ((attribute * widthRatio) / 100) / physicalWidthRatio;
  }

  static invertScale(attribute, propsObj) {
    const { widthRatio, physicalWidthRatio } = propsObj;
    return ((attribute * physicalWidthRatio) * 100) / widthRatio;
  }

  static calculatePositionAndRadius(propsObj) {
    const {
      cursorX,
      cursorY,
      slideWidth,
      slideHeight,
      radius,
      presenter,
      cursorLabelText,
      cursorLabelBox,

      // not a part of cursorLabelBox obj, since they are coming directly from the container
      labelBoxWidth,
      labelBoxHeight,
    } = propsObj;

    const {
      textDY,
      textDX,
      fontSize,
    } = cursorLabelText;

    const {
      labelBoxX,
      labelBoxY,
      labelBoxStrokeWidth,
      labelBoxXOffset,
      labelBoxYOffset,
    } = cursorLabelBox;

    return {
      fill: presenter ? 'red' : 'green',
      // Adjust the x,y cursor position according to zoom
      cx: (cursorX / 100) * slideWidth,
      cy: (cursorY / 100) * slideHeight,
      // Adjust the radius of the cursor according to zoom
      // and divide it by the physicalWidth ratio, so that svg scaling wasn't applied to the cursor
      finalRadius: Cursor.scale(radius, propsObj),
      // scaling the properties for cursorLabel and the border (rect) around it
      cursorLabelText: {
        textDY: Cursor.scale(textDY, propsObj),
        textDX: Cursor.scale(textDX, propsObj),
        fontSize: Cursor.scale(fontSize, propsObj),
      },
      cursorLabelBox: {
        x: Cursor.scale(labelBoxX, propsObj),
        y: Cursor.scale(labelBoxY, propsObj),
        width: Cursor.scale(labelBoxWidth + labelBoxXOffset, propsObj),
        height: Cursor.scale(labelBoxHeight + labelBoxYOffset, propsObj),
        strokeWidth: Cursor.scale(labelBoxStrokeWidth, propsObj),
      },
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

  componentDidMount() {
    // trigger initial animation on the cursor, otherwise it stays invisible until the next update
    this.cursorCoordinatesRef.beginElement();

    // we need to find the BBox of the text, so that we could set a proper border box arount it
    this.calculateCursorLabelBoxDimensions();
  }

  componentWillReceiveProps(nextProps) {
    const calculatedData = Cursor.calculatePositionAndRadius(nextProps);
    this.setState({
      prevData: this.state.currentData,
      currentData: calculatedData,
    });
  }

  componentDidUpdate() {
    this.cursorCoordinatesRef.beginElement();
    this.cursorRadiusRef.beginElement();
  }


  // this function retrieves the text node, measures its BBox and sets the size for the outer box
  calculateCursorLabelBoxDimensions() {
    let labelBoxWidth = 0;
    let labelBoxHeight = 0;

    if (this.cursorLabelRef) {
      const { width, height } = this.cursorLabelRef.getBBox();

      labelBoxWidth = Cursor.invertScale(width, this.props);
      labelBoxHeight = Cursor.invertScale(height, this.props);

      // if the width of the text node is bigger than the maxSize - set the width to maxWidth
      if (labelBoxWidth > this.props.cursorLabelBox.maxWidth) {
        labelBoxWidth = this.props.cursorLabelBox.maxWidth;
      }
    }

    // updating labelBoxWidth and labelBoxHeight in the container, which then passes it down here
    this.props.setLabelBoxDimensions(labelBoxWidth, labelBoxHeight);
  }

  render() {
    const {
      currentData,
      prevData,
    } = this.state;

    return (
      <g>
        <animateTransform
          ref={(ref) => { this.cursorCoordinatesRef = ref; }}
          attributeName="transform"
          type="translate"
          from={`${prevData.cx} ${prevData.cy}`}
          to={`${currentData.cx} ${currentData.cy}`}
          begin={'indefinite'}
          dur={CURSOR_MOVEMENT_ANIMATION_INTERVAL}
          repeatCount="0"
          fill="freeze"
        />
        <circle
          r={this.state.defaultRadius}
          fill={currentData.fill}
          fillOpacity="0.6"
        >
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
        <rect
          fill="white"
          fillOpacity="0.8"
          x={currentData.cursorLabelBox.x}
          y={currentData.cursorLabelBox.y}
          width={currentData.cursorLabelBox.width}
          height={currentData.cursorLabelBox.height}
          strokeWidth={currentData.cursorLabelBox.strokeWidth}
          stroke={currentData.fill}
          strokeOpacity="0.8"
        />
        <text
          ref={(ref) => { this.cursorLabelRef = ref; }}
          dy={currentData.cursorLabelText.textDY}
          dx={currentData.cursorLabelText.textDX}
          fontFamily="Arial"
          fontWeight="600"
          fill={currentData.fill}
          fillOpacity="0.8"
          fontSize={currentData.cursorLabelText.fontSize}
          clipPath={`url(#${this.props.cursorId})`}
        >
          {this.props.userName}
        </text>
        <clipPath id={this.props.cursorId}>
          <rect
            x={currentData.cursorLabelBox.x}
            y={currentData.cursorLabelBox.y}
            width={currentData.cursorLabelBox.width}
            height={currentData.cursorLabelBox.height}
          />
        </clipPath>
      </g>
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
   * Defines the cursor radius (not scaled)
   * @defaultValue 5
   */
  radius: PropTypes.number.isRequired,

  cursorLabelBox: PropTypes.shape({
    labelBoxX: PropTypes.number.isRequired,
    labelBoxY: PropTypes.number.isRequired,
    labelBoxStrokeWidth: PropTypes.number.isRequired,
    labelBoxXOffset: PropTypes.number.isRequired,
    labelBoxYOffset: PropTypes.number.isRequired,
    maxWidth: PropTypes.number.isRequired,
  }),
  cursorLabelText: PropTypes.shape({
    textDY: PropTypes.number.isRequired,
    textDX: PropTypes.number.isRequired,
    fontSize: PropTypes.number.isRequired,
  }),

  // Defines the id of the current cursor
  cursorId: PropTypes.string.isRequired,

  // Defines the user name for the cursor label
  userName: PropTypes.string.isRequired,

  // Defines the function, which sets the state for the label box and passes it back down
  // we need it, since we need to render the text first -> measure its dimensions ->
  // set proper width and height of the border box -> pass it down ->
  // catch in the 'componentWillReceiveProps' -> apply new values
  setLabelBoxDimensions: PropTypes.func.isRequired,
};

Cursor.defaultProps = {
  radius: 5,

  cursorLabelText: {
    textDY: 10,
    textDX: 11,
    fontSize: 12,
  },
  cursorLabelBox: {
    labelBoxX: 8,
    labelBoxY: -2,
    labelBoxStrokeWidth: 1,
    labelBoxXOffset: 4,
    labelBoxYOffset: 2,
    maxWidth: 65,
  },
};
