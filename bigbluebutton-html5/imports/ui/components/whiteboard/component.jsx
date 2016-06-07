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
    let x;
    let y;
    let viewBoxWidth;
    let viewBoxHeight;
    let slideObj = this.props.current_slide;
    if (this.props.current_slide) {
      slideObj = this.props.current_slide.slide;
      x = -this.props.current_slide.slide.x_offset * 2 * this.props.current_slide.slide.width / 100;
      y = -this.props.current_slide.slide.y_offset * 2 * this.props.current_slide.slide.height / 100;
      viewBoxWidth = this.props.current_slide.slide.width * this.props.current_slide.slide.width_ratio / 100;
      viewBoxHeight = this.props.current_slide.slide.height * this.props.current_slide.slide.height_ratio / 100;
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
            viewBox={ x + ' ' + y + ' ' + viewBoxWidth + ' ' + viewBoxHeight}
            version="1.1"
            xmlNS="http://www.w3.org/2000/svg"
            className={styles.svgStyles}
            key={slideObj.id}
          >

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
