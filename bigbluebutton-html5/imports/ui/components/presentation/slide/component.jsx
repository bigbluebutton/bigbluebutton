import React, { PropTypes } from 'react';

export default class Slide extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g>
        {this.props.currentSlide ?
          //some pdfs lose a white background color during the conversion to svg
          //their background color is transparent
          //that's why we have a white rectangle covering the whole slide area by default
          <g>
            <rect
              x="1"
              y="1"
              width={this.props.currentSlide.slide.width-2}
              height={this.props.currentSlide.slide.height-2}
              fill="white"
            >
            </rect>
            <image x="0" y="0"
              width={this.props.currentSlide.slide.width}
              height={this.props.currentSlide.slide.height}
              xlinkHref={this.props.currentSlide.slide.img_uri}
              strokeWidth="0.8"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
            </image>
          </g>
        : null }
      </g>
    );
  }
}
