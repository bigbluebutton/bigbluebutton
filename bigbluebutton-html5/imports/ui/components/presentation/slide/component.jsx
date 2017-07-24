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
        {this.props.currentSlide ?
          <g>
            <rect
              x="0"
              y="0"
              width={this.props.currentSlide.width}
              height={this.props.currentSlide.height}
              fill="white"
            />
            <image
              x="0"
              y="0"
              width={this.props.currentSlide.width}
              height={this.props.currentSlide.height}
              xlinkHref={imageUri}
              strokeWidth="0.8"
            />
          </g>
          : null}
      </g>
    );
  }
}
