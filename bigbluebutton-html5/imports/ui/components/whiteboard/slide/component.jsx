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
            width="1134" height="850.7076923076924"
            preserveAspectRatio="none"
            xlink="http://www.w3.org/1999/xlink"
            xlinkHref={this.props.current_slide.slide.img_uri}
            style={{ WebkitTapHighlightColor: 'transparent' }} //need to figure why we need this
            stroke-width="0.8">
          </image>
            : null
          }
      </g>
    );
  }
}
