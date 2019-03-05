import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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
import MediaService, { shouldEnableSwapLayout } from '../media/service';
import PresentationCloseButton from './presentation-close-button/component';
import DownloadPresentationButton from './download-presentation-button/component';
import FullscreenButton from '../video-provider/fullscreen-button/component';

const intlMessages = defineMessages({
  presentationLabel: {
    id: 'app.presentationUploder.title',
    description: 'presentation area element label',
  },
  slideContent: {
    id: 'app.presentation.slideContent',
    description: 'Slide content',
  },
  slideContentStart: {
    id: 'app.presentation.startSlideContent',
    description: 'Indicate the slide content start',
  },
  slideContentEnd: {
    id: 'app.presentation.endSlideContent',
    description: 'Indicate the slide content end',
  },
  noSlideContent: {
    id: 'app.presentation.emptySlideContent',
    description: 'No content available for slide',
  },
});

const isFullscreen = () => !(document.fullscreenElement === null
    || document.webkitFullscreenElement === null); // Edge

const renderPresentationClose = () => {
  if (!shouldEnableSwapLayout() || isFullscreen()) return null;
  return <PresentationCloseButton toggleSwapLayout={MediaService.toggleSwapLayout} />;
};

class PresentationArea extends Component {
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
      const { userIsPresenter, multiUser } = this.props;
      // By default presentation sizes are equal to the sizes of the refPresentationArea
      // direct parent of the svg wrapper
      let { clientWidth, clientHeight } = refPresentationArea;

      // if a user is a presenter - this means there is a whiteboard toolbar on the right
      // and we have to get the width/height of the refWhiteboardArea
      // (inner hidden div with absolute position)
      if (userIsPresenter || multiUser) {
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
    const { presentationHeight, presentationWidth } = this.state;
    const { currentSlide } = this.props;

    const originalWidth = currentSlide.calculatedData.width;
    const originalHeight = currentSlide.calculatedData.height;

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

  zoomChanger(incomingZoom) {
    const { zoom } = this.state;
    let newZoom = incomingZoom;
    const isDifferent = newZoom !== zoom;

    if (newZoom <= HUNDRED_PERCENT) {
      newZoom = HUNDRED_PERCENT;
    } else if (incomingZoom >= MAX_PERCENT) {
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
    const { fitToWidth } = this.state;
    this.setState({ fitToWidth: !fitToWidth });
  }

  isPresentationAccessible() {
    const { currentSlide } = this.props;
    // sometimes tomcat publishes the slide url, but the actual file is not accessible (why?)
    return currentSlide && currentSlide.calculatedData;
  }

  // renders the whole presentation area
  renderPresentationArea() {
    const { fitToWidth } = this.state;
    const { podId, currentSlide, intl } = this.props;
    if (!this.isPresentationAccessible()) return null;

    // to control the size of the svg wrapper manually
    // and adjust cursor's thickness, so that svg didn't scale it automatically
    const adjustedSizes = this.calculateSize();
    // a reference to the slide object
    const slideObj = currentSlide;

    const presentationCloseButton = renderPresentationClose();
    const presentationFullscreenButton = this.renderPresentationFullscreen();
    const presentationDownloadButton = this.renderPresentationDownload();

    const slideContent = currentSlide.content ? `${intl.formatMessage(intlMessages.slideContentStart)}
     ${currentSlide.content}
     ${intl.formatMessage(intlMessages.slideContentEnd)}` : intl.formatMessage(intlMessages.noSlideContent);

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
    const svgDimensions = fitToWidth ? {
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
        aria-label={intl.formatMessage(intlMessages.slideContent)}
        aria-describedby="currentSlideText"
      >
        <span id="currentSlideText" className={styles.visuallyHidden}>{slideContent}</span>
        {presentationCloseButton}
        {presentationFullscreenButton}
        {presentationDownloadButton}
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
              {...{
                width,
                height,
              }}
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
                  {...{
                    width,
                    height,
                  }}
                  whiteboardId={slideObj.id}
                />
                <CursorWrapperContainer
                  podId={podId}
                  whiteboardId={slideObj.id}
                  widthRatio={slideObj.widthRatio}
                  physicalWidthRatio={adjustedSizes.width / width}
                  slideWidth={width}
                  slideHeight={height}
                  radius={fitToWidth ? 2 : 5}
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
    const {
      userIsPresenter, multiUser, podId, currentSlide,
    } = this.props;
    const {
      delta, zoom, touchZoom, fitToWidth,
    } = this.state;

    if (!userIsPresenter && !multiUser) return null;

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
        {...{
          podId,
          touchZoom,
          fitToWidth,
          zoom,
          delta,
          viewBoxWidth,
          viewBoxHeight,
          adjustedSizes,
        }}
        currentSlideNum={currentSlide.num}
        whiteboardId={slideObj.id}
        slide={slideObj}
        slideWidth={width}
        slideHeight={height}
        zoomChanger={this.zoomChanger}
        getSvgRef={this.getSvgRef}
        presentationSize={this.getPresentationSizesAvailable()}
      >
        <WhiteboardOverlayContainer
          {...{
            zoom,
            viewBoxWidth,
            viewBoxHeight,
          }}
          getSvgRef={this.getSvgRef}
          whiteboardId={slideObj.id}
          slideWidth={width}
          slideHeight={height}
          viewBoxX={x}
          viewBoxY={y}
          pointChanger={this.pointUpdate}
          physicalSlideWidth={(adjustedSizes.width / slideObj.widthRatio) * 100}
          physicalSlideHeight={(adjustedSizes.height / slideObj.heightRatio) * 100}
          zoomChanger={this.zoomChanger}
          touchUpdate={this.touchUpdate}
        />
      </PresentationOverlayContainer>
    );
  }

  renderPresentationFullscreen() {
    const { intl } = this.props;
    if (isFullscreen()) return null;

    const full = () => {
      const presentation = this.refPresentationContainer;
      if (presentation.requestFullscreen) {
        presentation.requestFullscreen();
      } else if (presentation.webkitRequestFullscreen) { // Edge
        presentation.webkitRequestFullscreen();
      }
    };

    return (
      <FullscreenButton
        handleFullscreen={full}
        elementName={intl.formatMessage(intlMessages.presentationLabel)}
        dark
      />
    );
  }

  renderPresentationDownload() {
    const { presentationIsDownloadable, downloadPresentationUri } = this.props;

    if (!presentationIsDownloadable) return null;

    const handleDownloadPresentation = () => {
      window.open(downloadPresentationUri);
    };

    return (
      <DownloadPresentationButton
        handleDownloadPresentation={handleDownloadPresentation}
        dark
      />
    );
  }

  renderPresentationToolbar() {
    const { zoom } = this.state;
    const { currentSlide, podId } = this.props;
    if (!currentSlide) return null;

    return (
      <PresentationToolbarContainer
        {...{
          podId,
          zoom,
        }}
        currentSlideNum={currentSlide.num}
        presentationId={currentSlide.presentationId}
        zoomChanger={this.zoomChanger}
        fitToWidthHandler={this.fitToWidthHandler}
      />
    );
  }

  renderWhiteboardToolbar() {
    const { currentSlide } = this.props;
    if (!this.isPresentationAccessible()) return null;

    const adjustedSizes = this.calculateSize();
    return (
      <WhiteboardToolbarContainer
        whiteboardId={currentSlide.id}
        height={adjustedSizes.height}
      />
    );
  }

  render() {
    const { showSlide } = this.state;
    const { userIsPresenter, multiUser } = this.props;

    return (
      <div
        ref={(ref) => { this.refPresentationContainer = ref; }}
        className={styles.presentationContainer}
      >
        <div
          ref={(ref) => { this.refPresentationArea = ref; }}
          className={styles.presentationArea}
        >
          <div
            ref={(ref) => { this.refWhiteboardArea = ref; }}
            className={styles.whiteboardSizeAvailable}
          />
          {showSlide ? this.renderPresentationArea() : null}
          {userIsPresenter || multiUser ? this.renderWhiteboardToolbar() : null}
        </div>
        {this.renderPresentationToolbar()}
      </div>
    );
  }
}

export default injectIntl(PresentationArea);

PresentationArea.propTypes = {
  intl: intlShape.isRequired,
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
