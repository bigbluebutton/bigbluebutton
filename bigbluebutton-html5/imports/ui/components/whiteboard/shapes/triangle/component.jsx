import React, { PropTypes } from 'react';

export default class TriangleDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var style = {
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    };
    return (

      //style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); stroke-linejoin: round;"
      <path
        style={style}
        fill=""
        stroke=""
        d=""
        stroke-width=""
        stroke-linejoin=""
      >
      </path>
    );
  }
}
