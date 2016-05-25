import React, { PropTypes } from 'react';

export default class PencilDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // this is how style might look like with Raphael:
    // style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); stroke-linejoin: round; stroke-linecap: round;">
    var style = {
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    };
    return (
      <path
        fill=""
        stroke=""
        d=""
        strokeWidth=""
        strokeLinejoin=""
        strokeLinecap=""
        style={style}>
      </path>
    );
  }
}
