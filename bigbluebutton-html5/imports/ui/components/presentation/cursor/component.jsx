import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Cursor extends Component {
  static scale(attribute, widthRatio, physicalWidthRatio) {
    return (attribute * widthRatio) / physicalWidthRatio;
  }

  static invertScale(attribute, widthRatio, physicalWidthRatio) {
    return (attribute * physicalWidthRatio) / widthRatio;
  }

  static getCursorCoordinates(cursorX, cursorY, slideWidth, slideHeight) {
    // main cursor x and y coordinates
    const x = (cursorX / 100) * slideWidth;
    const y = (cursorY / 100) * slideHeight;

    return {
      x,
      y,
    };
  }

  static getFillAndLabel(presenter, isMultiUser) {
    const obj = {
      fill: 'green',
      displayLabel: false,
    };

    if (presenter) {
      obj.fill = 'red';
    }

    if (isMultiUser) {
      obj.displayLabel = true;
    }

    return obj;
  }

  static getScaledSizes(props) {
    // TODO: This might need to change for the use case of fit-to-width portrait
    //       slides in non-presenter view. Some elements are still shrinking.
    const scaleFactor = props.widthRatio / props.physicalWidthRatio;

    return {
      // Adjust the radius of the cursor according to zoom
      // and divide it by the physicalWidth ratio, so that svg scaling wasn't applied to the cursor
      finalRadius: props.radius * scaleFactor,
      // scaling the properties for cursorLabel and the border (rect) around it
      cursorLabelText: {
        textDY: props.cursorLabelText.textDY * scaleFactor,
        textDX: props.cursorLabelText.textDX * scaleFactor,
        fontSize: props.cursorLabelText.fontSize * scaleFactor,
      },
      cursorLabelBox: {
        xOffset: props.cursorLabelBox.xOffset * scaleFactor,
        yOffset: props.cursorLabelBox.yOffset * scaleFactor,
        // making width and height a little bit larger than the size of the text
        // received from BBox, so that the text didn't touch the border
        width: (props.labelBoxWidth + 3) * scaleFactor,
        height: (props.labelBoxHeight + 3) * scaleFactor,
        strokeWidth: props.cursorLabelBox.labelBoxStrokeWidth * scaleFactor,
      },
    };
  }

  componentWillMount() {
    const {
      cursorX,
      cursorY,
      slideWidth,
      slideHeight,
      presenter,
      isMultiUser,
    } = this.props;

    // setting the initial cursor info
    this.scaledSizes = Cursor.getScaledSizes(this.props);
    this.cursorCoordinate = Cursor.getCursorCoordinates(
      cursorX,
      cursorY,
      slideWidth,
      slideHeight,
    );

    const { fill, displayLabel } = Cursor.getFillAndLabel(presenter, isMultiUser);
    this.fill = fill;
    this.displayLabel = displayLabel;
  }

  componentDidMount() {
    // we need to find the BBox of the text, so that we could set a proper border box arount it
    this.calculateCursorLabelBoxDimensions();
  }

  componentWillReceiveProps(nextProps) {
    const {
      presenter,
      isMultiUser,
      widthRatio,
      physicalWidthRatio,
      labelBoxWidth,
      labelBoxHeight,
      cursorX,
      cursorY,
    } = this.props;

    if (presenter !== nextProps.presenter || isMultiUser !== nextProps.isMultiUser) {
      const { fill, displayLabel } = Cursor.getFillAndLabel(
        nextProps.presenter,
        nextProps.isMultiUser,
      );
      this.displayLabel = displayLabel;
      this.fill = fill;
    }

    if ((widthRatio !== nextProps.widthRatio
          || physicalWidthRatio !== nextProps.physicalWidthRatio)
      || (labelBoxWidth !== nextProps.labelBoxWidth
          || labelBoxHeight !== nextProps.labelBoxHeight)) {
      this.scaledSizes = Cursor.getScaledSizes(nextProps);
    }

    if (cursorX !== nextProps.cursorX || cursorY !== nextProps.cursorY) {
      const cursorCoordinate = Cursor.getCursorCoordinates(
        nextProps.cursorX,
        nextProps.cursorY,
        nextProps.slideWidth,
        nextProps.slideHeight,
      );
      this.cursorCoordinate = cursorCoordinate;
    }
  }

  // this function retrieves the text node, measures its BBox and sets the size for the outer box
  calculateCursorLabelBoxDimensions() {
    const {
      setLabelBoxDimensions,
    } = this.props;

    let labelBoxWidth = 0;
    let labelBoxHeight = 0;
    if (this.cursorLabelRef) {
      const { width, height } = this.cursorLabelRef.getBBox();
      const { widthRatio, physicalWidthRatio, cursorLabelBox } = this.props;
      labelBoxWidth = Cursor.invertScale(width, widthRatio, physicalWidthRatio);
      labelBoxHeight = Cursor.invertScale(height, widthRatio, physicalWidthRatio);

      // if the width of the text node is bigger than the maxSize - set the width to maxWidth
      if (labelBoxWidth > cursorLabelBox.maxWidth) {
        labelBoxWidth = cursorLabelBox.maxWidth;
      }
    }

    // updating labelBoxWidth and labelBoxHeight in the container, which then passes it down here
    setLabelBoxDimensions(labelBoxWidth, labelBoxHeight);
  }

  render() {
    const {
      cursorId,
      userName,
      isRTL,
    } = this.props;

    const {
      cursorCoordinate,
      fill,
    } = this;

    const {
      cursorLabelBox,
      cursorLabelText,
      finalRadius,
    } = this.scaledSizes;

    const {
      x,
      y,
    } = cursorCoordinate;

    const boxX = x + cursorLabelBox.xOffset;
    const boxY = y + cursorLabelBox.yOffset;

    return (
      <g
        x={x}
        y={y}
      >
        <circle
          cx={x}
          cy={y}
          r={finalRadius === Infinity ? 0 : finalRadius}
          fill={fill}
          fillOpacity="0.6"
        />
        {this.displayLabel
          ? (
            <g>
              <rect
                fill="white"
                fillOpacity="0.8"
                x={boxX}
                y={boxY}
                width={cursorLabelBox.width}
                height={cursorLabelBox.height}
                strokeWidth={cursorLabelBox.strokeWidth}
                stroke={fill}
                strokeOpacity="0.8"
              />
              <text
                ref={(ref) => { this.cursorLabelRef = ref; }}
                x={x}
                y={y}
                dy={cursorLabelText.textDY}
                dx={cursorLabelText.textDX}
                fontFamily="Arial"
                fontWeight="600"
                fill={fill}
                fillOpacity="0.8"
                fontSize={cursorLabelText.fontSize}
                clipPath={`url(#${cursorId})`}
                textAnchor={isRTL ? 'end' : 'start'}
              >
                {userName}
              </text>
              <clipPath id={cursorId}>
                <rect
                  x={boxX}
                  y={boxY}
                  width={cursorLabelBox.width}
                  height={cursorLabelBox.height}
                />
              </clipPath>
            </g>
          )
          : null }
      </g>
    );
  }
}

Cursor.propTypes = {
  // ESLint can't detect where all these propTypes are used, and they are not planning to fix it
  // so the next line disables eslint's no-unused-prop-types rule for this file.
  /* eslint-disable react/no-unused-prop-types */

  // Current presenter status
  presenter: PropTypes.bool.isRequired,
  // Current multi-user status
  isMultiUser: PropTypes.bool.isRequired,

  // Defines the id of the current cursor
  cursorId: PropTypes.string.isRequired,

  // Defines the user name for the cursor label
  userName: PropTypes.string.isRequired,

  // Defines the cursor x position
  cursorX: PropTypes.number.isRequired,

  // Defines the cursor y position
  cursorY: PropTypes.number.isRequired,

  // Slide to view box width ratio
  widthRatio: PropTypes.number.isRequired,

  // Slide physical size to original size ratio
  physicalWidthRatio: PropTypes.number.isRequired,

  // Slide width (svg)
  slideWidth: PropTypes.number.isRequired,
  // Slide height (svg)
  slideHeight: PropTypes.number.isRequired,

  /**
   * Defines the cursor radius (not scaled)
   * @defaultValue 5
   */
  radius: PropTypes.number,

  cursorLabelBox: PropTypes.shape({
    labelBoxStrokeWidth: PropTypes.number.isRequired,
    xOffset: PropTypes.number.isRequired,
    yOffset: PropTypes.number.isRequired,
    maxWidth: PropTypes.number.isRequired,
  }),
  cursorLabelText: PropTypes.shape({
    textDY: PropTypes.number.isRequired,
    textDX: PropTypes.number.isRequired,
    fontSize: PropTypes.number.isRequired,
  }),

  // Defines the width of the label box
  labelBoxWidth: PropTypes.number.isRequired,
  // Defines the height of the label box
  labelBoxHeight: PropTypes.number.isRequired,

  // Defines the function, which sets the state for the label box and passes it back down
  // we need it, since we need to render the text first -> measure its dimensions ->
  // set proper width and height of the border box -> pass it down ->
  // catch in the 'componentWillReceiveProps' -> apply new values
  setLabelBoxDimensions: PropTypes.func.isRequired,

  // Defines the direction the client text should be displayed
  isRTL: PropTypes.bool.isRequired,
};

Cursor.defaultProps = {
  radius: 5,
  cursorLabelText: {
    // text Y shift (10 points down)
    textDY: 10,
    // text X shift (10 points to the right)
    textDX: 10,
    // Initial label's font-size
    fontSize: 12,
  },
  cursorLabelBox: {
    // The thickness of the label box's border
    labelBoxStrokeWidth: 1,
    // X offset of the label box (8 points to the right)
    xOffset: 8,
    // Y offset of the label box (-2 points up)
    yOffset: -2,
    // Maximum width of the box, for the case when the user's name is too long
    maxWidth: 65,
  },
};
