import React, { PropTypes } from 'react';
import ShapeHelpers from '../helpers.js';
import ReactDOM from 'react-dom';

export default class TextDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  getCoordinates() {
    let x;
    let y;
    let width;
    let height;
    let fontSize;
    let fontColor;
    let calcedFontSize;
    let text;

    x = this.props.shape.x / 100 * this.props.slideWidth;
    y = this.props.shape.y / 100 * this.props.slideHeight;
    width = this.props.shape.textBoxWidth / 100 * this.props.slideWidth;
    height = this.props.shape.textBoxHeight / 100 * this.props.slideHeight;
    fontColor = ShapeHelpers.formatColor(this.props.shape.fontColor);
    fontSize = this.props.shape.fontSize;
    calcedFontSize = this.props.shape.calcedFontSize / 100 * this.props.slideHeight;
    text = this.props.shape.text;

    return {
      x: x,
      y: y,
      text: text,
      width: width,
      height: height,
      fontSize: fontSize,
      fontColor: fontColor,
      calcedFontSize: calcedFontSize,
    };
  }

  getStyles(results) {
    let styles = {
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
      pointerEvents: 'none',
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      fontStretch: 'normal',
      lineHeight: 'normal',
      fontFamily: 'Arial',
      wordWrap: 'break-word',
      wordBreak: 'normal',
      textAlign: 'left',
      margin: 0,
      color: results.fontColor,
      fontSize: results.calcedFontSize,
    };
    return styles;
  }

  render() {
    let results = this.getCoordinates();
    let styles = this.getStyles(results);

    return (
    <g>
      <clipPath id="c1">
        <rect
          x={results.x}
          y={results.y}
          width={results.width}
          height={results.height}
          fill="purple"
          strokeWidth="2"
        />
      </clipPath>

      <foreignObject
        clipPath="url(#c1)"
        x={results.x}
        y={results.y}
        width={results.width}
        height={results.height}
      >
        <p style={styles}>
          {results.text}
        </p>
      </foreignObject>
    </g>
    );
  }
}

TextDrawComponent.defaultProps = {

};
