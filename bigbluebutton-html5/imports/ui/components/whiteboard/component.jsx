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

  render() {
    return (

      <div
        id="whiteboard-paper"
        style={this.props.svgStyle}
        className={styles.whiteboard}
      >
        <div id="svggroup">
        { this.props.current_slide ?
          <ReactCSSTransitionGroup
            transitionName={ {
              enter: styles.enter,
              enterActive: styles.enterActive,
              appear: styles.appear,
              appearActive: styles.appearActive
            } }
            transitionAppear={true}
            transitionEnter={true}
            transitionLeave={false}
            transitionAppearTimeout={400}
            transitionEnterTimeout={400}
            transitionLeaveTimeout={400}
          >
            <svg
              {...this.props.svgProps}
              version="1.1"
              xmlNS="http://www.w3.org/2000/svg"
              style={this.props.svgStyle}
              key={this.props.current_slide.slide.id}
            >
              <Slide current_slide={this.props.current_slide} />
              { this.props.shapes ? this.props.shapes.map((shape) =>
                <WhiteboardShapeModel
                  shape={shape}
                  key={shape.shape.id}
                />
                )
              : null }
            </svg>
          </ReactCSSTransitionGroup>
        : null }
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
