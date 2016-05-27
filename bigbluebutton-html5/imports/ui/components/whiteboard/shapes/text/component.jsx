import React, { PropTypes } from 'react';

export default class TextDrawComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("I'm calling the text shape");
    var style = {
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    };
    return (
      // style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); text-anchor: start; font-style: normal; font-variant: normal; font-weight: normal; font-stretch: normal; font-size: 20px; line-height: normal; font-family: Arial;"
      <text
        x=""
        y=""
        text-anchor=""
        font=""
        stroke=""
        fill=""
        style={style}
        font-family=""
        font-size=""
        stroke-width=""
        >
        <tspan
          x=""
          dy=""
          >
        </tspan>
      </text>
    );
  }
}
