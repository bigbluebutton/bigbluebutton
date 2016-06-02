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
    if (this.props.current_slide) {
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
            viewBox={ '0 0 ' + this.props.current_slide.slide.width + ' ' + this.props.current_slide.slide.height}
            version="1.1"
            xmlNS="http://www.w3.org/2000/svg"
            className={styles.svgStyles}
            key={this.props.current_slide.slide.id}
          >

            <Slide current_slide={this.props.current_slide}/>
            {this.props.shapes ? this.props.shapes.map((shape) =>
              <WhiteboardShapeModel
                shape={shape}
                key={shape.shape.id}
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
