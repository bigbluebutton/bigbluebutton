import React, { PropTypes } from 'react';
import WhiteboardShapeModel from './shape-factory/component.jsx';
import { createContainer } from 'meteor/react-meteor-data';
import Slide from './slide/component.jsx';
import styles from './styles.scss';

export default class Whiteboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="whiteboard-paper" style={this.props.svgStyle} className={styles.whiteboard}>
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

Whiteboard.defaultProps = {
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
