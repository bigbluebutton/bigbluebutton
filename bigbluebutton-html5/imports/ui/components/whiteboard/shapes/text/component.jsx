import React from 'react';
import PropTypes from 'prop-types';
import ShapeHelpers from '../helpers.js';
import TextShapeService from './service.js';

export default class TextDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.shape.version != nextProps.shape.version;
  }

  componentDidMount() {
    if(this.props.isPresenter && this.props.shape.status != "textPublished") {
      this.focus();
    }
  }

  getCoordinates() {
    const x = this.props.shape.x / 100 * this.props.slideWidth;
    const y = this.props.shape.y / 100 * this.props.slideHeight;
    const width = this.props.shape.textBoxWidth / 100 * this.props.slideWidth;
    const height = this.props.shape.textBoxHeight / 100 * this.props.slideHeight;
    const fontColor = ShapeHelpers.formatColor(this.props.shape.fontColor);
    const fontSize = this.props.shape.fontSize;
    const calcedFontSize = this.props.shape.calcedFontSize / 100 * this.props.slideHeight;
    const text = this.props.shape.text;

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
      color: results.fontColor,
      fontSize: results.calcedFontSize,
    };
    return styles;
  }

  getPresenterStyles(results) {
    const styles = {
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
        <clipPath id={this.props.shape.id}>
          <rect
            x={results.x}
            y={results.y}
            width={results.width}
            height={results.height}
          />
        </clipPath>

        <foreignObject
          clipPath={`url(#${this.props.shape.id})`}
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

    // since textarea has a 1 px border which moves the text inside 1px down and right
    // we need to adjust and center foreign object (textarea's wrapper) accordingly
    // thus text won't make a 1px jump (top-left) after publishing
    const x = results.x - 1;
    const y = results.y - 1;
    const width = results.width + 2;
    const height = results.height + 2;

    return (
      <g>
        <foreignObject
          x={x}
          y={y}
          width={width}
          height={height}
          style={{pointerEvents: 'none'}}
        >
          <textarea
            maxLength="1024"
            ref={(ref) => { this.textArea = ref; }}
            onChange={this.onChangeHandler.bind(this)}
            onBlur={this.focus.bind(this)}
            style={styles}
          />
        </foreignObject>
      </g>
    );
  }

  onChangeHandler(event) {
    TextShapeService.setTextShapeValue(event.target.value);
  }

  focus() {
    // Explicitly focus the text input using the raw DOM API
    this.textArea.focus();
  }

  render() {
    let results = this.getCoordinates();

    if(this.props.isPresenter && this.props.shape.status != "textPublished") {
      return this.renderPresenterTextShape(results);
    } else {
      return this.renderViewerTextShape(results);
    }
  }
}

TextDrawComponent.defaultProps = {

};
