import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import AnnotationHelpers from '../helpers.js';

export default class TextDrawComponent extends React.Component {
  constructor(props) {
    super(props);

    this.handleFocus = this.handleFocus.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.version != nextProps.version ||
      this.props.isActive != nextProps.isActive;
  }

  componentDidMount() {
    if(this.props.isActive && this.props.annotation.status != "textPublished") {
      this.handleFocus();
    }
  }

  getCoordinates() {
    const x = this.props.annotation.x / 100 * this.props.slideWidth;
    const y = this.props.annotation.y / 100 * this.props.slideHeight;
    const width = this.props.annotation.textBoxWidth / 100 * this.props.slideWidth;
    const height = this.props.annotation.textBoxHeight / 100 * this.props.slideHeight;
    const fontColor = AnnotationHelpers.formatColor(this.props.annotation.fontColor);
    const fontSize = this.props.annotation.fontSize;
    const calcedFontSize = this.props.annotation.calcedFontSize / 100 * this.props.slideHeight;
    const text = this.props.annotation.text;

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

  getViewerStyles(results) {
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

  getPresenterStyles(results) {
    const styles = {
      fontFamily: 'Arial',
      border: '1px solid black',
      width: "100%",
      height: "100%",
      resize: 'none',
      overflow: 'hidden',
      outline: 'none',
      color: results.fontColor,
      fontSize: results.calcedFontSize,
      padding: "0",
    };

    return styles;
  }

  renderViewerTextShape(results) {
    const styles = this.getViewerStyles(results);

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
    const styles = this.getPresenterStyles(results);

    return (
      <g>
        <foreignObject
          x={results.x}
          y={results.y}
          width={results.width}
          height={results.height}
          style={{pointerEvents: 'none'}}
        >
          <textarea
            id={this.props.annotation.id}
            maxLength="1024"
            ref={(ref) => { this.textArea = ref; }}
            onChange={this.onChangeHandler.bind(this)}
            onBlur={this.handleOnBlur}
            style={styles}
          />
        </foreignObject>
      </g>
    );
  }

  onChangeHandler(event) {
    this.props.setTextShapeValue(event.target.value);
  }

  handleOnBlur(event) {

    // it'd be better to use ref to focus onBlur (handleFocus), but it doesn't want to work in FF
    // so we are back to the old way of doing things, getElementById and setTimeout
    let node = document.getElementById(this.props.annotation.id);
    setTimeout(function() { node.focus(); }, 1);
  }

  handleFocus() {
    // Explicitly focus the text input using the raw DOM API
    this.textArea.focus();
  }

  render() {
    let results = this.getCoordinates();

    if(this.props.isActive && this.props.annotation.status != "textPublished") {
      return this.renderPresenterTextShape(results);
    } else {
      return this.renderViewerTextShape(results);
    }
  }
}

TextDrawComponent.defaultProps = {

};
