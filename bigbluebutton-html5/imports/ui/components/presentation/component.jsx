import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import WhiteboardOverlayContainer from '/imports/ui/components/whiteboard/whiteboard-overlay/container';
import WhiteboardToolbarContainer from '/imports/ui/components/whiteboard/whiteboard-toolbar/container';
import { HUNDRED_PERCENT, MAX_PERCENT } from '/imports/utils/slideCalcUtils';
import CursorWrapperContainer from './cursor/cursor-wrapper-container/container';
import AnnotationGroupContainer from '../whiteboard/annotation-group/container';
import PresentationToolbarContainer from './presentation-toolbar/container';
import PresentationOverlayContainer from './presentation-overlay/container';
import Slide from './slide/component';
import { styles } from './styles.scss';
import MediaService from '../media/service';
import PresentationCloseButton from './presentation-close-button/component';
import FullscreenButton from '../video-provider/fullscreen-button/component';

export default class PresentationArea extends Component {
  constructor() {
    super();

    this.state = {
      presentationWidth: 0,
      presentationHeight: 0,
      showSlide: false,
      zoom: 100,
      touchZoom: false,
      delta: {
        x: 0,
        y: 0,
      },
      fitToWidth: false,
    };

    this.getSvgRef = this.getSvgRef.bind(this);
    this.zoomChanger = this.zoomChanger.bind(this);
    this.touchUpdate = this.touchUpdate.bind(this);
    this.pointUpdate = this.pointUpdate.bind(this);
    this.fitToWidthHandler = this.fitToWidthHandler.bind(this);
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

  zoomChanger(zoom) {
    let newZoom = zoom;
    const isDifferent = newZoom !== this.state.zoom;

    if (newZoom <= HUNDRED_PERCENT) {
      newZoom = HUNDRED_PERCENT;
    } else if (zoom >= MAX_PERCENT) {
      newZoom = MAX_PERCENT;
    }
    if (isDifferent) this.setState({ zoom: newZoom });
  }

  pointUpdate(pointX, pointY) {
    this.setState({
      delta: {
        x: pointX,
        y: pointY,
      },
    });
  }

  touchUpdate(bool) {
    this.setState({
      touchZoom: bool,
    });
  }

  fitToWidthHandler() {
    this.setState({
      fitToWidth: !this.state.fitToWidth,
    });
  }

  // renders the whole presentation area
  renderPresentationArea() {
    if (!this.isPresentationAccessible()) {
      return null;
    }
    // to control the size of the svg wrapper manually
    // and adjust cursor's thickness, so that svg didn't scale it automatically
    const adjustedSizes = this.calculateSize();
    // a reference to the slide object
    const slideObj = this.props.currentSlide;

    const presentationCloseButton = this.renderPresentationClose();
    const presentationFullscreenButton = this.renderPresentationFullscreen();

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
    const svgDimensions = this.state.fitToWidth ? {
      position: 'absolute',
      width: 'inherit',
    } : {
      position: 'absolute',
      width: adjustedSizes.width,
      height: adjustedSizes.height,
    };
    return (
      <div
        style={svgDimensions}
      >
        {presentationCloseButton}
        {presentationFullscreenButton}
        <TransitionGroup>
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
              data-test="whiteboard"
              width={width}
              height={height}
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
                  podId={this.props.podId}
                  whiteboardId={slideObj.id}
                  widthRatio={slideObj.widthRatio}
                  physicalWidthRatio={adjustedSizes.width / width}
                  slideWidth={width}
                  slideHeight={height}
                  radius={this.state.fitToWidth ? 2 : 5}
                />
              </g>
              {this.renderOverlays(slideObj, adjustedSizes)}
            </svg>
          </CSSTransition>
        </TransitionGroup>
      </div>
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
        podId={this.props.podId}
        currentSlideNum={this.props.currentSlide.num}
        slide={slideObj}
        whiteboardId={slideObj.id}
        slideWidth={width}
        slideHeight={height}
        delta={this.state.delta}
        viewBoxWidth={viewBoxWidth}
        viewBoxHeight={viewBoxHeight}
        zoom={this.state.zoom}
        zoomChanger={this.zoomChanger}
        adjustedSizes={adjustedSizes}
        getSvgRef={this.getSvgRef}
        presentationSize={this.getPresentationSizesAvailable()}
        touchZoom={this.state.touchZoom}
        fitToWidth={this.state.fitToWidth}
      >
        <WhiteboardOverlayContainer
          getSvgRef={this.getSvgRef}
          whiteboardId={slideObj.id}
          slideWidth={width}
          slideHeight={height}
          viewBoxX={x}
          viewBoxY={y}
          pointChanger={this.pointUpdate}
          viewBoxWidth={viewBoxWidth}
          viewBoxHeight={viewBoxHeight}
          physicalSlideWidth={(adjustedSizes.width / slideObj.widthRatio) * 100}
          physicalSlideHeight={(adjustedSizes.height / slideObj.heightRatio) * 100}
          zoom={this.state.zoom}
          zoomChanger={this.zoomChanger}
          touchUpdate={this.touchUpdate}
        />
      </PresentationOverlayContainer>
    );
  }

  isPresentationAccessible() {
    // sometimes tomcat publishes the slide url, but the actual file is not accessible (why?)
    return this.props.currentSlide && this.props.currentSlide.calculatedData;
  };

  isFullscreen() {
    return document.fullscreenElement !== null;
  }

  renderPresentationClose() {
    if (!MediaService.shouldEnableSwapLayout() || this.isFullscreen()) {
      return null;
    }
    return <PresentationCloseButton toggleSwapLayout={MediaService.toggleSwapLayout} />;
  };

  renderPresentationFullscreen() {
    if (this.isFullscreen()) {
      return null;
    }
    const full = () => this.refPresentationContainer.requestFullscreen();

    return <FullscreenButton handleFullscreen={full} dark />;
  }

  renderPresentationToolbar() {
    if (!this.props.currentSlide) {
      return null;
    }

    return (
      <PresentationToolbarContainer
        podId={this.props.podId}
        currentSlideNum={this.props.currentSlide.num}
        presentationId={this.props.currentSlide.presentationId}
        zoom={this.state.zoom}
        zoomChanger={this.zoomChanger}
        fitToWidthHandler={this.fitToWidthHandler}
      />
    );
  }

  renderWhiteboardToolbar() {
    if (!this.isPresentationAccessible()) {
      return null;
    }

    const adjustedSizes = this.calculateSize();
    return (
      <WhiteboardToolbarContainer
        whiteboardId={this.props.currentSlide.id}
        height={adjustedSizes.height}
      />
    );
  }

  render() {
    return (
      <div
        ref={(ref) => { this.refPresentationContainer = ref; }}
        className={styles.presentationContainer}>
        <div
          ref={(ref) => { this.refPresentationArea = ref; }}
          className={styles.presentationArea}
        >
          <div
            ref={(ref) => { this.refWhiteboardArea = ref; }}
            className={styles.whiteboardSizeAvailable}
          />
          {this.state.showSlide
            ? this.renderPresentationArea()
            : null }
          {this.props.userIsPresenter || this.props.multiUser
            ? this.renderWhiteboardToolbar()
            : null }
        </div>
        {this.renderPresentationToolbar()}
      </div>
    );
  }
}

PresentationArea.propTypes = {
  podId: PropTypes.string.isRequired,
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
