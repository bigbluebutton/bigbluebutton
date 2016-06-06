import React, { PropTypes } from 'react';

export default class EllipseDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"
    var style = {
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    };
    return (
      <ellipse
        cx=""
        cy=""
        rx=""
        ry=""
        fill=""
        stroke=""
        stroke-width=""
        style={style}
      >
      </ellipse>
    );
  }
}
