import React, { PropTypes } from 'react';

export default class PencilDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // this is how style might look like with Raphael:
    // style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); stroke-linejoin: round; stroke-linecap: round;">
    pathStyle = {
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
    };
    return (
      <path
        fill=""
        stroke=""
        d=""
        strokeWidth=""
        strokeLinejoin=""
        strokeLinecap=""
        style={pathStyle}>
      </path>
    );
  }
}
