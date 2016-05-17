import React, { Component, PropTypes } from 'react';
import WhiteboardShapeModel from '../whiteboard/shape-factory/component.jsx';
// import SVGDOMPropertyConfig from 'react/lib/SVGDOMPropertyConfig.js';

export default class Svg extends Component {
  render() {
    return (
      <svg version='1.1' xmlNS='http://www.w3.org/2000/svg' {...this.props.svgProps} style={this.props.svgStyle}>
        {this.props.children}
      </svg>
    );
  }
}

Svg.propTypes = {
  children: function (props, propName, componentName) {
    var error;
    var prop = props[propName];
    React.Children.forEach(prop, function (child) {
      console.log(child);
      if (child.type !== WhiteboardShapeModel) {
        error = new Error(
          '`' + componentName + '` only accepts children of type `WhiteboardShapeModel`.'
        );
      }
    });

    return error;
  },
};
