import React, { PropTypes } from 'react';

export default class Slide extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g>
        {this.props.slideHref ?
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
            >
            </rect>
            <image x="0" y="0"
              width={this.props.svgWidth}
              height={this.props.svgHeight}
              xlinkHref={this.props.slideHref}
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
