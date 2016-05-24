import React, { PropTypes } from 'react';

export default class RectangleDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
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
        //style=""
        >
      </rect>
    );
  }
}
