import React, { PropTypes } from 'react';
import Svg from '../../shared/Svg.jsx';

export default class WhiteboardPaper extends React.Component {
  constructor(props) {
    super(props);
    //var Component = allComponents['Svg'];
  }

  render() {
    var allComponents = { 'Svg': Svg };
    var test = 'Svg';
    var Component = allComponents[test];
    return (
      <div id="whiteboard-paper" style={this.props.svgStyle}>
        <div id="svggroup">
          <Component svgProps={this.props.svgProps} svgStyle={this.props.svgStyle}>

          </Component>
        </div>
      </div>
    );
  }
}

WhiteboardPaper.defaultProps = {
  svgProps: {
    width:'1134',
    height:'850.5',
    preserveAspectRatio: 'xMinYMin slice',
    viewBox:'0 0 1134 850.5',
  },
  svgStyle: {
    overflow: 'hidden',
    position: 'relative',
  },
};

/*

<Svg {...this.props} />

 <svg height="850.5"
 version="1.1"
 width="1134"
 xmlns="http://www.w3.org/2000/svg"
 style="overflow: hidden; position: relative;"
 viewBox="0 0 1134 850.5"
 preserveAspectRatio="xMinYMin"></svg>
*/

 /* getDefaultProps: function() {
    return {
      id: 'whiteboard-paper',
      version: '1.1',
      xmlns: 'http://www.w3.org/2000/svg',
      width:'1134',
      height:'850.5',
      style: 'overflow: hidden; position: relative;',
      preserveAspectRatio: 'xMinYMin slice',
      viewBox:'0 0 1134 850.5'
    };
  },
*/

/*

SvgContainer.propTypes = {
	children: function (props, propName, componentName) {
      var error;
      var prop = props[propName];

      React.Children.forEach(prop, function (child) {
        if (child.type !== 'Shape') {
          error = new Error(
            '`' + componentName + '` only accepts children of type `Shape`.'
          );
        }
      });
      return error;
    }
  },,
};
*/
