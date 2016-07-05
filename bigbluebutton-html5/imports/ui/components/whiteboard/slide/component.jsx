import React, { PropTypes } from 'react';

export default class Slide extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g>
        {this.props.currentSlide ?
          <image x="0" y="0"
            width={this.props.currentSlide.slide.width}
            height={this.props.currentSlide.slide.height}
            xlink="http://www.w3.org/1999/xlink"
            xlinkHref={this.props.currentSlide.slide.img_uri}
            stroke-width="0.8">
          </image>
        : null }
      </g>
    );
  }
}
