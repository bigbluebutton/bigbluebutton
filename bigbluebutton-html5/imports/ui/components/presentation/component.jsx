import React from 'react';
import PropTypes from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import PollingContainer from '/imports/ui/components/polling/container';
import AnnotationGroupContainer from '../whiteboard/annotation-group/container';
import Cursor from './cursor/component';
import PresentationToolbarContainer from './presentation-toolbar/container';
import Slide from './slide/component';
import styles from './styles.scss';

export default class PresentationArea extends React.Component {
  constructor(props) {
    super(props);
  }

  renderPresentationArea() {
    let slideObj = this.props.currentSlide;

    if (this.props.currentSlide) {
      slideObj = this.props.currentSlide;
      const x = -slideObj.xOffset * 2 * slideObj.width / 100;
      const y = -slideObj.yOffset * 2 * slideObj.height / 100;
      const viewBoxWidth = slideObj.width * slideObj.widthRatio / 100;
      const viewBoxHeight = slideObj.height * slideObj.heightRatio / 100;
      return (
        <CSSTransitionGroup
          transitionName={{
            enter: styles.enter,
            enterActive: styles.enterActive,
            appear: styles.appear,
            appearActive: styles.appearActive,
          }}
          transitionAppear
          transitionEnter
          transitionLeave={false}
          transitionAppearTimeout={400}
          transitionEnterTimeout={400}
          transitionLeaveTimeout={400}
        >
          <svg
            viewBox={`${x} ${y} ${viewBoxWidth} ${viewBoxHeight}`}
            version="1.1"

            // it's supposed to be here in theory
            // but now it's ignored by all the browsers and it's not supported by React
            // xmlNS="http://www.w3.org/2000/svg"
            className={styles.svgStyles}
            key={slideObj.id}
          >
            <defs>
              <clipPath id="viewBox">
                <rect x={x} y={y} width="100%" height="100%" fill="none" />
              </clipPath>
            </defs>
            <g clipPath="url(#viewBox)">
              <Slide id="slideComponent" currentSlide={this.props.currentSlide} />
              <AnnotationGroupContainer
                width={slideObj.width}
                height={slideObj.height}
                whiteboardId={slideObj.id}
              />
              {this.props.cursor ?
                <Cursor
                  viewBoxWidth={viewBoxWidth}
                  viewBoxHeight={viewBoxHeight}
                  viewBoxX={x}
                  viewBoxY={y}
                  widthRatio={slideObj.widthRatio}
                  cursorX={this.props.cursor.x}
                  cursorY={this.props.cursor.y}
                />
              : null }
            </g>
          </svg>
        </CSSTransitionGroup>
      );
    }
    return null;
  }

  renderPresentationToolbar() {
    if (this.props.currentSlide) {
      return (
        <PresentationToolbarContainer
          currentSlideNum={this.props.currentSlide.num}
          presentationId={this.props.currentSlide.presentationId}
        />
      );
    }
    return null;
  }

  render() {
    return (
      <div className={styles.presentationContainer}>
        <div className={styles.presentationWrapper}>
          <div className={styles.presentationPaper}>
            {this.renderPresentationArea()}
          </div>
        </div>
        <PollingContainer />
        {this.renderPresentationToolbar()}
      </div>
    );
  }
}

PresentationArea.defaultProps = {
  svgProps: {

  },
  svgStyle: {

  },
};
