import React, { PropTypes } from 'react';

export default class Slide extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g>
        {this.props.current_slide ?
          <image x="0" y="0"
            width={this.props.current_slide.slide.width}
            height={this.props.current_slide.slide.height}
            xlink="http://www.w3.org/1999/xlink"
            xlinkHref={this.props.current_slide.slide.img_uri}
            stroke-width="0.8">
          </image>
        : null }
      </g>
    );
  }
}
