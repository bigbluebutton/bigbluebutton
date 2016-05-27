import React, { PropTypes } from 'react';

export default class RectangleDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var style = {
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    };
    return (
      //style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"
      <rect
        x=""
        y=""
        width=""
        height=""
        r=""
        rx=""
        ry=""
        fill=""
        stroke=""
        stroke-width=""
        style={style}
        >
      </rect>
    );
  }
}
