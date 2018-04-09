import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
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
      showSlide: false,
    };

    this.getSvgRef = this.getSvgRef.bind(this);
  }

  componentDidMount() {
    // adding an event listener to scale the whiteboard on 'resize' events sent by chat/userlist etc
    window.addEventListener('resize', () => {
      setTimeout(this.handleResize.bind(this), 0);
    });

    this.getInitialPresentationSizes();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => {
      setTimeout(this.handleResize.bind(this), 0);
    });
  }

  // returns a ref to the svg element, which is required by a WhiteboardOverlay
  // to transform screen coordinates to svg coordinate system
  getSvgRef() {
    return this.svggroup;
  }

  getPresentationSizesAvailable() {
    const { refPresentationArea, refWhiteboardArea } = this;
    const presentationSizes = {};

    if (refPresentationArea && refWhiteboardArea) {
      // By default presentation sizes are equal to the sizes of the refPresentationArea
      // direct parent of the svg wrapper
      let { clientWidth, clientHeight } = refPresentationArea;

      // if a user is a presenter - this means there is a whiteboard toolbar on the right
      // and we have to get the width/height of the refWhiteboardArea
      // (inner hidden div with absolute position)
      if (this.props.userIsPresenter || this.props.multiUser) {
        ({ clientWidth, clientHeight } = refWhiteboardArea);
      }

      presentationSizes.presentationHeight = clientHeight;
      presentationSizes.presentationWidth = clientWidth;
    }
    return presentationSizes;
  }

  getInitialPresentationSizes() {
    // determining the presentationWidth and presentationHeight (available space for the svg)
    // on the initial load
    const presentationSizes = this.getPresentationSizesAvailable();
    if (Object.keys(presentationSizes).length > 0) {
      // setting the state of the available space for the svg
      // and set the showSlide to true to start rendering the slide
      this.setState({
        presentationHeight: presentationSizes.presentationHeight,
        presentationWidth: presentationSizes.presentationWidth,
        showSlide: true,
      });
    }
  }

  handleResize() {
    const presentationSizes = this.getPresentationSizesAvailable();
    if (Object.keys(presentationSizes).length > 0) {
      // updating the size of the space available for the slide
      this.setState(presentationSizes);
    }
  }

  calculateSize() {
    const originalWidth = this.props.currentSlide.calculatedData.width;
    const originalHeight = this.props.currentSlide.calculatedData.height;
    const { presentationHeight, presentationWidth } = this.state;

    let adjustedWidth;
    let adjustedHeight;

    // Slide has a portrait orientation
    if (originalWidth <= originalHeight) {
      adjustedWidth = (presentationHeight * originalWidth) / originalHeight;
      if (presentationWidth < adjustedWidth) {
        adjustedHeight = (presentationHeight * presentationWidth) / adjustedWidth;
        adjustedWidth = presentationWidth;
      } else {
        adjustedHeight = presentationHeight;
      }

      // Slide has a landscape orientation
    } else {
      adjustedHeight = (presentationWidth * originalHeight) / originalWidth;
      if (presentationHeight < adjustedHeight) {
        adjustedWidth = (presentationWidth * presentationHeight) / adjustedHeight;
        adjustedHeight = presentationHeight;
      } else {
        adjustedWidth = presentationWidth;
      }
    }
    return {
      width: adjustedWidth,
      height: adjustedHeight,
    };
  }

  // renders the whole presentation area
  renderPresentationArea() {
    // sometimes tomcat publishes the slide url, but the actual file is not accessible (why?)
    if (!this.props.currentSlide ||
        !this.props.currentSlide.calculatedData ||
        !this.state.showSlide) {
      return null;
    }
    // to control the size of the svg wrapper manually
    // and adjust cursor's thickness, so that svg didn't scale it automatically
    const adjustedSizes = this.calculateSize();

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
            // width={width}
            // height={height}
            style={{
              maxHeight: `${adjustedSizes.height}px`,
            }}
            preserveAspectRatio="xMidYMid meet"
            ref={(ref) => { if (ref != null) { this.svggroup = ref; } }}
            viewBox={`${x} ${y} ${viewBoxWidth} ${viewBoxHeight}`}
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.svgStyles}
          >
            <defs>
              <clipPath id="viewBox">
                <rect x={x} y={y} width="100%" height="100%" fill="none" />
              </clipPath>
            </defs>
            <g clipPath="url(#viewBox)">
              <Slide
                id="slideComponent"
                imageUri={imageUri}
                svgWidth={width}
                svgHeight={height}
              />
              <AnnotationGroupContainer
                width={width}
                height={height}
                whiteboardId={slideObj.id}
              />
              <CursorWrapperContainer
                widthRatio={slideObj.widthRatio}
                physicalWidthRatio={adjustedSizes.width / width}
                slideWidth={width}
                slideHeight={height}
              />
            </g>
            {this.renderOverlays(slideObj, adjustedSizes)}
          </svg>
        </CSSTransition>
      </TransitionGroup>
    );
  }

  renderOverlays(slideObj, adjustedSizes) {
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
          physicalSlideWidth={(adjustedSizes.width / slideObj.widthRatio) * 100}
          physicalSlideHeight={(adjustedSizes.height / slideObj.heightRatio) * 100}
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

    const adjustedSizes = this.calculateSize();
    return (
      <WhiteboardToolbarContainer
        whiteboardId={this.props.currentSlide.id}
      />
    );
  }

  render() {
    return (
      <div className={styles.presentationContainer} id="presentationContainer">
        <div
          ref={(ref) => { this.refPresentationArea = ref; }}
          className={styles.presentationArea}
        >
          <div
            ref={(ref) => { this.refWhiteboardArea = ref; }}
            className={styles.whiteboardSizeAvailable}
          />
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
