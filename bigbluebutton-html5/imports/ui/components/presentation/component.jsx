import React, { PropTypes } from 'react';
import ShapeGroupContainer from '../whiteboard/shape-group/container.jsx';
import Cursor from './cursor/component.jsx';
import PresentationToolbarContainer from './presentation-toolbar/container.jsx';
import Slide from './slide/component.jsx';
import styles from './styles.scss';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PollingContainer from '/imports/ui/components/polling/container';
import PresentationOverlayContainer from './presentation-overlay/container';

export default class PresentationArea extends React.Component {
  constructor(props) {
    super(props);
  }

  renderPresentationArea() {
    let slideObj = this.props.currentSlide;

    if (this.props.currentSlide) {
      slideObj = this.props.currentSlide.slide;
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

            //it's supposed to be here in theory
            //but now it's ignored by all the browsers and it's not supported by React
            //xmlNS="http://www.w3.org/2000/svg"
            className={styles.svgStyles}
            key={slideObj.id}
          >
            <defs>
              <clipPath id="viewBox">
                <rect x={x} y={y} width="100%" height="100%" fill="none"/>
              </clipPath>
            </defs>
            <g clipPath="url(#viewBox)">
              <Slide id="slideComponent" currentSlide={this.props.currentSlide}/>
              <ShapeGroupContainer
                width = {slideObj.width}
                height = {slideObj.height}
                whiteboardId = {slideObj.id}
              />
              {this.props.cursor ?
                <Cursor
                viewBoxWidth={viewBoxWidth}
                viewBoxHeight={viewBoxHeight}
                viewBoxX={x}
                viewBoxY={y}
                widthRatio={slideObj.width_ratio}
                cursorX={this.props.cursor.x}
                cursorY={this.props.cursor.y}
                />
              : null }
            </g>
            {this.props.userIsPresenter ?
              <PresentationOverlayContainer
                x={x}
                y={y}
                vbwidth={viewBoxWidth}
                vbheight={viewBoxHeight}
              />
            : null }
          </svg>
        </ReactCSSTransitionGroup>
      );
    } else {
      return null;
    }
  }

  renderPresentationToolbar() {
    if (this.props.currentSlide) {
      return (
        <PresentationToolbarContainer
          currentSlideNum={this.props.currentSlide.slide.num}
          presentationId={this.props.currentSlide.presentationId}
        />
      );
    } else {
      return null;
    }
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
