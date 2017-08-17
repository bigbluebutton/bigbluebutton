import React from 'react';
import PropTypes from 'prop-types';

export default class Slide extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const imageUri = this.props.currentSlide.svgUri || this.props.currentSlide.pngUri;

    return (
      <g>
        {imageUri ?
          //some pdfs lose a white background color during the conversion to svg
          //their background color is transparent
          //that's why we have a white rectangle covering the whole slide area by default
          <g>
            <rect
              x="1"
              y="1"
              width={this.props.svgWidth-2}
              height={this.props.svgHeight-2}
              fill="white"
            />
            <image
              x="0"
              y="0"
              width={this.props.svgWidth}
              height={this.props.svgHeight}
              xlinkHref={imageUri}
              strokeWidth="0.8"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            />
          </g>
          : null}
      </g>
    );
  }
}
