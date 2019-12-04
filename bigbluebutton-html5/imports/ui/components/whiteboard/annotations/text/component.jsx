import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RenderInBrowser from 'react-render-in-browser';
import AnnotationHelpers from '../helpers';

const DRAW_END = Meteor.settings.public.whiteboard.annotations.status.end;

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
    const isFireFox = document.body.className.includes('firefox');
    const isSarafi = document.body.className.includes('safari');
    const styles = {
      fontFamily: 'Arial',
      border: `${isFireFox || isSarafi ? '2px' : '1px'} solid black`,
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
    const { isActive, annotation } = this.props;
    // iOS doesn't show the keyboard if the input field was focused by event NOT invoked by a user
    // by it still technically moves the focus there
    // that's why we have a separate case for iOS - we don't focus here automatically
    // but we focus on the next "tap" invoked by a user
    const iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
    const Android = navigator.userAgent.toLowerCase().indexOf('android') > -1;

    // unsupported Firefox condition (not iOS though) can be removed when FF 59 is released
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=1409113
    const unsupportedFirefox = navigator.userAgent.indexOf('Firefox/57') !== -1
                            || navigator.userAgent.indexOf('Firefox/58') !== -1;

    if (iOS || (Android && unsupportedFirefox)) { return; }

    if (isActive && annotation.status !== DRAW_END) {
      this.handleFocus();
    }
  }

  shouldComponentUpdate(nextProps) {
    const { version, isActive } = this.props;
    return version !== nextProps.version
      || isActive !== nextProps.isActive;
  }

  // If the user is drawing a text shape and clicks Undo - reset textShapeId
  componentWillUnmount() {
    const { isActive, resetTextShapeActiveId } = this.props;
    if (isActive) {
      resetTextShapeActiveId();
    }
  }

  onChangeHandler(event) {
    const { setTextShapeValue } = this.props;
    setTextShapeValue(event.target.value);
  }

  getCoordinates() {
    const { annotation, slideWidth, slideHeight } = this.props;
    const {
      x,
      y,
      textBoxWidth,
      textBoxHeight,
      fontColor,
      fontSize,
      calcedFontSize,
      text,
    } = annotation;

    const _x = (x / 100) * slideWidth;
    const _y = (y / 100) * slideHeight;
    const _width = (textBoxWidth / 100) * slideWidth;
    const _height = (textBoxHeight / 100) * slideHeight;
    const _fontColor = AnnotationHelpers.getFormattedColor(fontColor);
    const _fontSize = fontSize;
    const _calcedFontSize = (calcedFontSize / 100) * slideHeight;
    const _text = text;

    return {
      x: _x,
      y: _y,
      text: _text,
      width: _width,
      height: _height,
      fontSize: _fontSize,
      fontColor: _fontColor,
      calcedFontSize: _calcedFontSize,
    };
  }

  handleOnBlur() {
    const { annotation } = this.props;
    // it'd be better to use ref to focus onBlur (handleFocus), but it doesn't want to work in FF
    // so we are back to the old way of doing things, getElementById and setTimeout
    const node = document.getElementById(annotation.id);
    setTimeout(() => { node.focus(); }, 1);
  }

  handleFocus() {
    // Explicitly focus the text input using the raw DOM API
    this.textArea.focus();
  }

  renderViewerTextShape(results) {
    const { annotation } = this.props;
    const styles = TextDrawComponent.getViewerStyles(results);

    return (
      <g>
        <RenderInBrowser only firefox>
          <clipPath id={annotation.id}>
            <rect
              x={results.x}
              y={results.y}
              width={results.width}
              height={results.height}
            />
          </clipPath>
        </RenderInBrowser>
        <foreignObject
          clipPath={`url(#${annotation.id})`}
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
    const { annotation } = this.props;
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
            id={annotation.id}
            maxLength="1024"
            ref={(ref) => { this.textArea = ref; }}
            onChange={this.onChangeHandler}
            onBlur={this.handleOnBlur}
            style={styles}
            spellCheck="false"
          />
        </foreignObject>
      </g>
    );
  }

  render() {
    const { isActive, annotation } = this.props;
    const results = this.getCoordinates();

    if (isActive && annotation.status !== DRAW_END) {
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
  // Defines a function that resets the textShape active Id in case if a user clicks Undo
  // while drawing a shape
  resetTextShapeActiveId: PropTypes.func.isRequired,
};
