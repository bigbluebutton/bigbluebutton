import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import _ from 'lodash';
import WhiteboardOverlayContainer from '/imports/ui/components/whiteboard/whiteboard-overlay/container';
import WhiteboardToolbarContainer from '/imports/ui/components/whiteboard/whiteboard-toolbar/container';
import PollingContainer from '/imports/ui/components/polling/container';
import CursorWrapperContainer from './cursor/cursor-wrapper-container/container';
import AnnotationGroupContainer from '../whiteboard/annotation-group/container';
import PresentationToolbarContainer from './presentation-toolbar/container';
import PresentationOverlayContainer from './presentation-overlay/container';
import Slide from './slide/component';
import { styles } from './styles.scss';


export default class PresentationArea extends Component {
  constructor() {
    super();

    this.state = {
      presentationWidth: 0,
      presentationHeight: 0,
    };

    this.getSvgRef = this.getSvgRef.bind(this);
    this.ticking = false;
    this.svggroup = false;
    this.viewBox = false;
    this.handleResize = _.throttle(this.handleResize.bind(this), 66);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
  }

  // returns a ref to the svg element, which is required by a WhiteboardOverlay
  // to transform screen coordinates to svg coordinate system
  getSvgRef() {
    return this.svggroup;
  }

  handleResize() {
    if (!this.viewBox) {
      return;
    }

    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.ticking = false;

        const viewBoxRect = this.viewBox.getBoundingClientRect();
        this.setState({
          presentationWidth: viewBoxRect.width,
          presentationHeight: viewBoxRect.height,
        });
      });
    }

    this.ticking = true;
  }

  // renders the whole presentation area
  renderPresentationArea() {
    // sometimes tomcat publishes the slide url, but the actual file is not accessible (why?)
    if (!this.props.currentSlide ||
        !this.props.currentSlide.calculatedData) {
      return null;
    }

    // a reference to the slide object
    const slideObj = this.props.currentSlide;

    // retrieving the pre-calculated data from the slide object
    const {
      x,
      y,
      width,
      height,
      viewBoxWidth,
      viewBoxHeight,
      imageUri,
    } = slideObj.calculatedData;

    return (
      <TransitionGroup className={styles.slideArea} id="presentationAreaData">
        <CSSTransition
          key={slideObj.id}
          classNames={{
            enter: styles.enter,
            enterActive: styles.enterActive,
            appear: styles.appear,
            appearActive: styles.appearActive,
          }}
          appear
          enter
          exit={false}
          timeout={{ enter: 400 }}
        >
          <svg
            preserveAspectRatio="xMidYMid meet"
            ref={(ref) => { if (ref) this.svggroup = ref; }}
            viewBox={`${x} ${y} ${viewBoxWidth} ${viewBoxHeight}`}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.svgStyles}
          >
            <defs>
              <clipPath id="viewBox" ref={(ref) => { if (ref && this.viewBox !== ref) this.viewBox = ref; }}>
                <rect x={x} y={y} width="100%" height="100%" fill="none" />
              </clipPath>
            </defs>
            <g clipPath="url(#viewBox)">
              <Slide
                id="slideComponent"
                imageUri={imageUri}
                svgWidth={width}
                svgHeight={height}
                onLoad={this.handleResize}
              />
              <AnnotationGroupContainer
                width={width}
                height={height}
                whiteboardId={slideObj.id}
              />
              <CursorWrapperContainer
                widthRatio={slideObj.widthRatio}
                physicalWidthRatio={this.state.presentationWidth / width}
                slideWidth={width}
                slideHeight={height}
              />
            </g>
            {this.renderOverlays(slideObj)}
          </svg>
        </CSSTransition>
      </TransitionGroup>
    );
  }

  renderOverlays(slideObj) {
    if (!this.props.userIsPresenter && !this.props.multiUser) {
      return null;
    }

    // retrieving the pre-calculated data from the slide object
    const {
      x,
      y,
      width,
      height,
      viewBoxWidth,
      viewBoxHeight,
    } = slideObj.calculatedData;

    return (
      <PresentationOverlayContainer
        slideWidth={width}
        slideHeight={height}
        getSvgRef={this.getSvgRef}
      >
        <WhiteboardOverlayContainer
          getSvgRef={this.getSvgRef}
          whiteboardId={slideObj.id}
          slideWidth={width}
          slideHeight={height}
          viewBoxX={x}
          viewBoxY={y}
          viewBoxWidth={viewBoxWidth}
          viewBoxHeight={viewBoxHeight}
          physicalSlideWidth={(this.state.presentationWidth / slideObj.widthRatio) * 100}
          physicalSlideHeight={(this.state.presentationHeight / slideObj.heightRatio) * 100}
        />
      </PresentationOverlayContainer>
    );
  }

  renderPresentationToolbar() {
    if (!this.props.currentSlide) {
      return null;
    }

    return (
      <PresentationToolbarContainer
        userIsPresenter={this.props.userIsPresenter}
        currentSlideNum={this.props.currentSlide.num}
        presentationId={this.props.currentSlide.presentationId}
      />
    );
  }

  renderWhiteboardToolbar() {
    if (!this.props.currentSlide ||
        !this.props.currentSlide.calculatedData ||
        !(this.props.userIsPresenter || this.props.multiUser)) {
      return null;
    }

    return (
      <WhiteboardToolbarContainer whiteboardId={this.props.currentSlide.id} />
    );
  }

  render() {
    return (
      <div className={styles.presentationContainer} id="presentationContainer">
        <div className={styles.presentationArea}>
          {this.renderWhiteboardToolbar()}
          {this.renderPresentationArea()}
          {this.renderPresentationToolbar()}
        </div>
        <PollingContainer />
      </div>
    );
  }
}

PresentationArea.propTypes = {
  // Defines a boolean value to detect whether a current user is a presenter
  userIsPresenter: PropTypes.bool.isRequired,
  currentSlide: PropTypes.shape({
    presentationId: PropTypes.string.isRequired,
    current: PropTypes.bool.isRequired,
    heightRatio: PropTypes.number.isRequired,
    widthRatio: PropTypes.number.isRequired,
    xOffset: PropTypes.number.isRequired,
    yOffset: PropTypes.number.isRequired,
    num: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    calculatedData: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      viewBoxWidth: PropTypes.number.isRequired,
      viewBoxHeight: PropTypes.number.isRequired,
      imageUri: PropTypes.string.isRequired,
    }),
  }),
  // current multi-user status
  multiUser: PropTypes.bool.isRequired,
};

PresentationArea.defaultProps = {
  currentSlide: undefined,
};
