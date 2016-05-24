import React, { PropTypes } from 'react';
import WhiteboardShapeModel from '../shape-factory/component.jsx';
import WhiteboardPaperService from './service.js';
import { createContainer } from 'meteor/react-meteor-data';
import Slide from '../slide/component.jsx';

export default class WhiteboardPaper extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div id="whiteboard-paper" style={this.props.svgStyle}>
        <div id="svggroup">
          <svg version='1.1' xmlNS='http://www.w3.org/2000/svg' {...this.props.svgProps} style={this.props.svgStyle}>
            <Slide current_slide={this.props.current_slide} />
            { this.props.shapes ? this.props.shapes.map((shape) =>
              <WhiteboardShapeModel shape={shape} key={shape.shape.id}/>
            ) : null }
          </svg>
        </div>
      </div>
    );
  }
}

export default createContainer(() => {
  const data = WhiteboardPaperService.getWhiteboardData();
  return data;
}, WhiteboardPaper);

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
