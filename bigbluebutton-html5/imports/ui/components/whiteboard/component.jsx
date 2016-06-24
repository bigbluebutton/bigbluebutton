import React, { PropTypes } from 'react';
import WhiteboardShapeModel from './shape-factory/component.jsx';
import { createContainer } from 'meteor/react-meteor-data';
import Slide from './slide/component.jsx';
import styles from './styles.scss';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Whiteboard extends React.Component {
  constructor(props) {
    super(props);
  }

  renderWhiteboard() {
    let slideObj = this.props.current_slide;
    if (this.props.current_slide) {
      slideObj = this.props.current_slide.slide;
      let x = -slideObj.x_offset * 2 * slideObj.width / 100;
      let y = -slideObj.y_offset * 2 * slideObj.height / 100;
      let viewBoxWidth = slideObj.width * slideObj.width_ratio / 100;
      let viewBoxHeight = slideObj.height * slideObj.height_ratio / 100;
      return (
        <ReactCSSTransitionGroup
          transitionName={ {
            enter: styles.enter,
            enterActive: styles.enterActive,
            appear: styles.appear,
            appearActive: styles.appearActive,
          } }
          transitionAppear={true}
          transitionEnter={true}
          transitionLeave={false}
          transitionAppearTimeout={400}
          transitionEnterTimeout={400}
          transitionLeaveTimeout={400}
        >
          <svg
            viewBox={`${x} ${y} ${viewBoxWidth} ${viewBoxHeight}`}
            version="1.1"
            xmlNS="http://www.w3.org/2000/svg"
            className={styles.svgStyles}
            key={slideObj.id}
          >
            <defs>
              <clipPath id="viewBox">
                <rect x={x} y={y} width="100%" height="100%" fill="none"/>
              </clipPath>
            </defs>
            <g clipPath="url(#viewBox)">
              <Slide current_slide={this.props.current_slide}/>
              {this.props.shapes ? this.props.shapes.map((shape) =>
                <WhiteboardShapeModel
                  shape={shape.shape}
                  key={shape.shape.id}
                  slideWidth = {slideObj.width}
                  slideHeight = {slideObj.height}
                  widthRatio={slideObj.width_ratio}
                  heightRatio={slideObj.height_ratio}
                />
                )
              : null }
            </g>
          </svg>
        </ReactCSSTransitionGroup>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <div className={styles.whiteboardPaper}>
        {this.renderWhiteboard()}
      </div>
    );
  }
}

Whiteboard.defaultProps = {
  svgProps: {

  },
  svgStyle: {

  },
};
