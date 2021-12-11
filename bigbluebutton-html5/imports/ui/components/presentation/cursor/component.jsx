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
    const wbConf = Meteor.settings.public.whiteboard;
    const cursorColorNonPresenter = wbConf.cursorColorNonPresenter ? wbConf.cursorColorNonPresenter : '#00ff00';
    const cursorColorPresenter = wbConf.cursorColor ? wbConf.cursorColor : '#ff0000';
    const cursorColorNonPresenterXor = '#' + ('000000' + (('0xffffff' ^ '0x'+cursorColorNonPresenter.slice(-6)).toString(16))).slice(-6);
    const cursorColorPresenterXor = '#' + ('000000' + (('0xffffff' ^ '0x'+cursorColorPresenter.slice(-6)).toString(16))).slice(-6);
    
    const obj = {
      labelColor: cursorColorNonPresenter,
      showFg: true,
      fillFg: cursorColorNonPresenter,
      blendFg: 'normal',
      opacityFg: 0.6,
      showBg: false,
      fillBg: '#ffffff',
      blendBg: 'difference',
      opacityBg: 1.0,
      displayLabel: false,
    };

    if (presenter) {
      obj.labelColor = cursorColorPresenter;
      obj.fillFg = cursorColorPresenter;
    }

    if (isMultiUser) {
      obj.displayLabel = true;
    }

    switch (wbConf.cursorMode) {
      case 'border':
        obj.showBg = true;
        break;
      case 'complementary':
        obj.fillFg = '#ffffff';
        obj.blendFg = 'difference';
        obj.opacityFg = 1.0;
        break;
      case 'xorcolor':
        obj.fillFg = cursorColorNonPresenterXor;
        obj.blendFg = 'difference';
        obj.opacityFg = 1.0;
        if (presenter) {
          obj.fillFg = cursorColorPresenterXor;
        }
        break;
    }
    return obj;
  }

  static getScaledSizes(props, state) {
    // TODO: This might need to change for the use case of fit-to-width portrait
    //       slides in non-presenter view. Some elements are still shrinking.
    const scaleFactor = props.widthRatio / props.physicalWidthRatio;

    return {
      // Adjust the radius of the cursor according to zoom
      // and divide it by the physicalWidth ratio, so that svg scaling wasn't applied to the cursor
      finalRadius: props.radius * scaleFactor,
      finalRadiusBg: props.radius * scaleFactor * 1.1,
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
        width: (state.labelBoxWidth + 3) * scaleFactor,
        height: (state.labelBoxHeight + 3) * scaleFactor,
        strokeWidth: props.cursorLabelBox.labelBoxStrokeWidth * scaleFactor,
      },
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      scaledSizes: null,
      labelBoxWidth: 0,
      labelBoxHeight: 0,
    };

    this.setLabelBoxDimensions = this.setLabelBoxDimensions.bind(this);
  }

  componentDidMount() {
    const {
      cursorX,
      cursorY,
      slideWidth,
      slideHeight,
      presenter,
      isMultiUser,
    } = this.props;

    this.setState({
      scaledSizes: Cursor.getScaledSizes(this.props, this.state),
    });
    this.cursorCoordinate = Cursor.getCursorCoordinates(
      cursorX,
      cursorY,
      slideWidth,
      slideHeight,
    );

    const {
      labelColor,
      showFg,
      fillFg,
      blendFg,
      opacityFg,
      showBg,
      fillBg,
      blendBg,
      opacityBg,
      displayLabel,
    } = Cursor.getFillAndLabel(presenter, isMultiUser);

    this.labelColor = labelColor;
    this.showFg = showFg;
    this.fillFg = fillFg;
    this.blendFg = blendFg;
    this.opacityFg = opacityFg;
    this.showBg = showBg;
    this.fillBg = fillBg;
    this.blendBg = blendBg;
    this.opacityBg = opacityBg;
    this.displayLabel = displayLabel;
    // we need to find the BBox of the text, so that we could set a proper border box arount it
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      scaledSizes,
    } = this.state;
    if (!prevState.scaledSizes && scaledSizes) {      
      this.calculateCursorLabelBoxDimensions();
    }

    const {
      presenter,
      isMultiUser,
      widthRatio,
      physicalWidthRatio,
      cursorX,
      cursorY,
      slideWidth,
      slideHeight,
    } = this.props;
    const {
      labelBoxWidth,
      labelBoxHeight,
    } = this.state;

    const {
      labelBoxWidth: prevLabelBoxWidth,
      labelBoxHeight: prevLabelBoxHeight,
    } = prevState;

    if (presenter !== prevProps.presenter || isMultiUser !== prevProps.isMultiUser) {
      const { labelColor, fillFg, displayLabel } = Cursor.getFillAndLabel(
        presenter,
        isMultiUser,
      );
      this.displayLabel = displayLabel;
      this.fillFg = fillFg;
      this.labelColor = labelColor;
    }

    if ((widthRatio !== prevProps.widthRatio
          || physicalWidthRatio !== prevProps.physicalWidthRatio)
      || (labelBoxWidth !== prevLabelBoxWidth
          || labelBoxHeight !== prevLabelBoxHeight)) {
            this.setState({
              scaledSizes: Cursor.getScaledSizes(this.props, this.state),
            });
    }

    if (cursorX !== prevProps.cursorX || cursorY !== prevProps.cursorY) {
      const cursorCoordinate = Cursor.getCursorCoordinates(
        cursorX,
        cursorY,
        slideWidth,
        slideHeight,
      );
      this.cursorCoordinate = cursorCoordinate;
    }
  }

  setLabelBoxDimensions(labelBoxWidth, labelBoxHeight) {    
    this.setState({
      labelBoxWidth,
      labelBoxHeight,
    });
  }

  // this function retrieves the text node, measures its BBox and sets the size for the outer box
  calculateCursorLabelBoxDimensions() {
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
    this.setLabelBoxDimensions(labelBoxWidth, labelBoxHeight);
  }

  render() {
    const {
      scaledSizes,
    } = this.state;
    const {
      cursorId,
      userName,
      isRTL,
    } = this.props;
    
    const {
      cursorCoordinate,
      labelColor,
      showFg,
      fillFg,
      blendFg,
      opacityFg,
      showBg,
      fillBg,
      blendBg,
      opacityBg,
      displayLabel,
    } = this;
    
    if (!scaledSizes) return null;
    const {
      cursorLabelBox,
      cursorLabelText,
      finalRadius,
      finalRadiusBg,
    } = scaledSizes;

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
        {showBg ?
        <circle
          style={{
            mixBlendMode: blendBg,
            fill: fillBg,
            fillOpacity: opacityBg,
          }}
          cx={x}
          cy={y}
          r={finalRadiusBg}
        /> : null}
        {showFg ?
        <circle
          style={{
            mixBlendMode: blendFg,
            fill: fillFg,
            fillOpacity: opacityFg,
          }}
          cx={x}
          cy={y}
          r={finalRadius}
        /> : null}
        {displayLabel
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
                stroke={labelColor}
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
                fill={labelColor}
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
