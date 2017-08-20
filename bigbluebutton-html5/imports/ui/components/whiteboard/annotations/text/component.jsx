import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AnnotationHelpers from '../helpers';

export default class TextDrawComponent extends Component {
  static getViewerStyles(results) {
    const styles = {
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
      pointerEvents: 'none',
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      fontStretch: 'normal',
      lineHeight: 'normal',
      fontFamily: 'Arial',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      wordBreak: 'normal',
      textAlign: 'left',
      margin: 0,

      // padding to match the border of the text area and the flash client's default 1px padding
      padding: 1,
      color: results.fontColor,
      fontSize: results.calcedFontSize,
    };
    return styles;
  }

  static getPresenterStyles(results) {
    const styles = {
      fontFamily: 'Arial',
      border: '1px solid black',
      width: '100%',
      height: '100%',
      resize: 'none',
      overflow: 'hidden',
      outline: 'none',
      color: results.fontColor,
      fontSize: results.calcedFontSize,
      padding: '0',
    };

    return styles;
  }

  constructor() {
    super();

    this.handleFocus = this.handleFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  componentDidMount() {
    if (this.props.isActive && this.props.annotation.status !== 'textPublished') {
      this.handleFocus();
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.version !== nextProps.version ||
      this.props.isActive !== nextProps.isActive;
  }

  onChangeHandler(event) {
    this.props.setTextShapeValue(event.target.value);
  }

  getCoordinates() {
    const { annotation, slideWidth, slideHeight } = this.props;

    const x = (annotation.x / 100) * slideWidth;
    const y = (annotation.y / 100) * slideHeight;
    const width = (annotation.textBoxWidth / 100) * slideWidth;
    const height = (annotation.textBoxHeight / 100) * slideHeight;
    const fontColor = AnnotationHelpers.formatColor(annotation.fontColor);
    const fontSize = annotation.fontSize;
    const calcedFontSize = (annotation.calcedFontSize / 100) * slideHeight;
    const text = annotation.text;

    return {
      x,
      y,
      text,
      width,
      height,
      fontSize,
      fontColor,
      calcedFontSize,
    };
  }

  handleOnBlur() {
    // it'd be better to use ref to focus onBlur (handleFocus), but it doesn't want to work in FF
    // so we are back to the old way of doing things, getElementById and setTimeout
    const node = document.getElementById(this.props.annotation.id);
    setTimeout(() => { node.focus(); }, 1);
  }

  handleFocus() {
    // Explicitly focus the text input using the raw DOM API
    this.textArea.focus();
  }

  renderViewerTextShape(results) {
    const styles = TextDrawComponent.getViewerStyles(results);

    return (
      <g>
        <clipPath id={this.props.annotation.id}>
          <rect
            x={results.x}
            y={results.y}
            width={results.width}
            height={results.height}
          />
        </clipPath>

        <foreignObject
          clipPath={`url(#${this.props.annotation.id})`}
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

  renderPresenterTextShape(results) {
    const styles = TextDrawComponent.getPresenterStyles(results);

    return (
      <g>
        <foreignObject
          x={results.x}
          y={results.y}
          width={results.width}
          height={results.height}
          style={{ pointerEvents: 'none' }}
        >
          <textarea
            id={this.props.annotation.id}
            maxLength="1024"
            ref={(ref) => { this.textArea = ref; }}
            onChange={this.onChangeHandler}
            onBlur={this.handleOnBlur}
            style={styles}
          />
        </foreignObject>
      </g>
    );
  }

  render() {
    const results = this.getCoordinates();

    if (this.props.isActive && this.props.annotation.status !== 'textPublished') {
      return this.renderPresenterTextShape(results);
    }
    return this.renderViewerTextShape(results);
  }
}

TextDrawComponent.propTypes = {
  // Defines a version of the shape, so that we know if we need to update the component or not
  version: PropTypes.number.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw text shape
  annotation: PropTypes.shape({
    calcedFontSize: PropTypes.number.isRequired,
    fontColor: PropTypes.number.isRequired,
    fontSize: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    textBoxWidth: PropTypes.number.isRequired,
    textBoxHeight: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  // Defines the width of the slide (svg coordinate system), which needed in calculations
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system), which needed in calculations
  slideHeight: PropTypes.number.isRequired,
  // Defines a flag which indicates that this shape is currently used by a presenter to draw text
  isActive: PropTypes.bool.isRequired,
  // Defines a function that sends updates from the active text shape  to the server
  setTextShapeValue: PropTypes.func.isRequired,
};
