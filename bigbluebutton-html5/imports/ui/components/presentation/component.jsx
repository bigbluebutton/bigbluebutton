import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import WhiteboardOverlayContainer from '/imports/ui/components/whiteboard/whiteboard-overlay/container';
import WhiteboardToolbarContainer from '/imports/ui/components/whiteboard/whiteboard-toolbar/container';
import { HUNDRED_PERCENT, MAX_PERCENT } from '/imports/utils/slideCalcUtils';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { toast } from 'react-toastify';
import PresentationToolbarContainer from './presentation-toolbar/container';
import CursorWrapperContainer from './cursor/cursor-wrapper-container/container';
import AnnotationGroupContainer from '../whiteboard/annotation-group/container';
import PresentationOverlayContainer from './presentation-overlay/container';
import Slide from './slide/component';
import { styles } from './styles.scss';
import toastStyles from '/imports/ui/components/toast/styles';
import MediaService, { shouldEnableSwapLayout } from '../media/service';
import PresentationCloseButton from './presentation-close-button/component';
import DownloadPresentationButton from './download-presentation-button/component';
import FullscreenService from '../fullscreen-button/service';
import FullscreenButtonContainer from '../fullscreen-button/container';
import { withDraggableConsumer } from '../media/webcam-draggable-overlay/context';
import Icon from '/imports/ui/components/icon/component';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';

const intlMessages = defineMessages({
  presentationLabel: {
    id: 'app.presentationUploder.title',
    description: 'presentation area element label',
  },
  changeNotification: {
    id: 'app.presentation.notificationLabel',
    description: 'label displayed in toast when presentation switches',
  },
  downloadLabel: {
    id: 'app.presentation.downloadLabel',
    description: 'label for downloadable presentations',
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

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

class PresentationArea extends PureComponent {
  constructor() {
    super();

    this.state = {
      presentationAreaWidth: 0,
      presentationAreaHeight: 0,
      showSlide: false,
      zoom: 100,
      fitToWidth: false,
      isFullscreen: false,
    };

    this.currentPresentationToastId = null;

    this.getSvgRef = this.getSvgRef.bind(this);
    this.setFitToWidth = this.setFitToWidth.bind(this);
    this.zoomChanger = this.zoomChanger.bind(this);
    this.updateLocalPosition = this.updateLocalPosition.bind(this);
    this.panAndZoomChanger = this.panAndZoomChanger.bind(this);
    this.fitToWidthHandler = this.fitToWidthHandler.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.getPresentationSizesAvailable = this.getPresentationSizesAvailable.bind(this);
    this.handleResize = this.handleResize.bind(this);


    this.onResize = () => setTimeout(this.handleResize.bind(this), 0);
    this.renderCurrentPresentationToast = this.renderCurrentPresentationToast.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    const { prevProps } = state;
    const stateChange = { prevProps: props };

    if (props.userIsPresenter
      && (!prevProps || !prevProps.userIsPresenter)
      && props.currentSlide
      && props.slidePosition) {
      let potentialZoom = 100 / (props.slidePosition.viewBoxWidth / props.slidePosition.width);
      potentialZoom = Math.max(HUNDRED_PERCENT, Math.min(MAX_PERCENT, potentialZoom));
      stateChange.zoom = potentialZoom;
    }

    if (!prevProps) return stateChange;

    // When presenter is changed or slide changed we reset localPosition
    if (prevProps.currentSlide.id !== props.currentSlide.id
      || prevProps.userIsPresenter !== props.userIsPresenter) {
      stateChange.localPosition = undefined;
    }

    return stateChange;
  }

  componentDidMount() {
    this.getInitialPresentationSizes();
    this.refPresentationContainer.addEventListener('fullscreenchange', this.onFullscreenChange);
    window.addEventListener('resize', this.onResize, false);
    window.addEventListener('layoutSizesSets', this.onResize, false);
    window.addEventListener('webcamAreaResize', this.handleResize, false);

    const { slidePosition, layoutContextDispatch } = this.props;

    let currWidth = 0;
    let currHeight = 0;

    if (slidePosition) {
      currWidth = slidePosition.width;
      currHeight = slidePosition.height;
    }

    layoutContextDispatch({
      type: 'setPresentationSlideSize',
      value: {
        width: currWidth,
        height: currHeight,
      },
    });

    if (currWidth > currHeight || currWidth === currHeight) {
      layoutContextDispatch({
        type: 'setPresentationOrientation',
        value: 'landscape',
      });
    }
    if (currHeight > currWidth) {
      layoutContextDispatch({
        type: 'setPresentationOrientation',
        value: 'portrait',
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      currentPresentation,
      slidePosition,
      layoutSwapped,
      currentSlide,
      publishedPoll,
      isViewer,
      toggleSwapLayout,
      restoreOnUpdate,
      layoutContextDispatch,
      layoutContextState,
      userIsPresenter,
    } = this.props;

    const { numUsersVideo } = layoutContextState;
    const { layoutContextState: prevLayoutContextState } = prevProps;
    const {
      numUsersVideo: prevNumUsersVideo,
    } = prevLayoutContextState;

    if (numUsersVideo !== prevNumUsersVideo) {
      this.onResize();
    }

    if (prevProps.slidePosition.id !== slidePosition.id) {
      window.dispatchEvent(new Event('slideChanged'));
    }

    const { width: prevWidth, height: prevHeight } = prevProps.slidePosition;
    const { width: currWidth, height: currHeight } = slidePosition;

    if (prevWidth !== currWidth || prevHeight !== currHeight) {
      layoutContextDispatch({
        type: 'setPresentationSlideSize',
        value: {
          width: currWidth,
          height: currHeight,
        },
      });
      if (currWidth > currHeight || currWidth === currHeight) {
        layoutContextDispatch({
          type: 'setPresentationOrientation',
          value: 'landscape',
        });
      }
      if (currHeight > currWidth) {
        layoutContextDispatch({
          type: 'setPresentationOrientation',
          value: 'portrait',
        });
      }
    }

    const downloadableOn = !prevProps.currentPresentation.downloadable
      && currentPresentation.downloadable;

    const shouldCloseToast = !(currentPresentation.downloadable && !userIsPresenter);

    if (
      prevProps.currentPresentation.name !== currentPresentation.name
      || (downloadableOn && !userIsPresenter)
    ) {
      if (this.currentPresentationToastId) {
        toast.update(this.currentPresentationToastId, {
          autoClose: shouldCloseToast,
          render: this.renderCurrentPresentationToast(),
        });
      } else {
        this.currentPresentationToastId = toast(this.renderCurrentPresentationToast(), {
          onClose: () => { this.currentPresentationToastId = null; },
          autoClose: shouldCloseToast,
          className: toastStyles.actionToast,
        });
      }
    }

    const downloadableOff = prevProps.currentPresentation.downloadable
      && !currentPresentation.downloadable;

    if (this.currentPresentationToastId && downloadableOff) {
      toast.update(this.currentPresentationToastId, {
        autoClose: true,
        render: this.renderCurrentPresentationToast(),
      });
    }

    if (layoutSwapped && restoreOnUpdate && isViewer && currentSlide) {
      const slideChanged = currentSlide.id !== prevProps.currentSlide.id;
      const positionChanged = slidePosition.viewBoxHeight !== prevProps.slidePosition.viewBoxHeight
        || slidePosition.viewBoxWidth !== prevProps.slidePosition.viewBoxWidth;
      const pollPublished = publishedPoll && !prevProps.publishedPoll;
      if (slideChanged || positionChanged || pollPublished) {
        toggleSwapLayout();
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize, false);
    window.removeEventListener('layoutSizesSets', this.onResize, false);
    this.refPresentationContainer.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  onFullscreenChange() {
    const { layoutContextDispatch } = this.props;
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(this.refPresentationContainer);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
      layoutContextDispatch({ type: 'setPresentationFullscreen', value: newIsFullscreen });
    }
  }

  // returns a ref to the svg element, which is required by a WhiteboardOverlay
  // to transform screen coordinates to svg coordinate system
  getSvgRef() {
    return this.svggroup;
  }

  getToolbarHeight() {
    const { refPresentationToolbar } = this;
    let height = 0;
    if (refPresentationToolbar) {
      const { clientHeight } = refPresentationToolbar;
      height = clientHeight;
    }
    return height;
  }

  getPresentationSizesAvailable() {
    const { layoutContextState } = this.props;
    const {
      presentationAreaSize,
      webcamsAreaResizing,
      mediaBounds,
      tempWebcamsAreaSize,
      webcamsPlacement,
    } = layoutContextState;
    const presentationSizes = {
      presentationAreaWidth: 0,
      presentationAreaHeight: 0,
    };

    presentationSizes.presentationAreaWidth = webcamsAreaResizing && (webcamsPlacement === 'left' || webcamsPlacement === 'right')
      ? mediaBounds.width - tempWebcamsAreaSize.width
      : presentationAreaSize.width;
    presentationSizes.presentationAreaHeight = webcamsAreaResizing && (webcamsPlacement === 'top' || webcamsPlacement === 'bottom')
      ? mediaBounds.height - tempWebcamsAreaSize.height - (this.getToolbarHeight() || 0) - 30
      : presentationAreaSize.height - (this.getToolbarHeight() || 0);
    return presentationSizes;
  }

  getInitialPresentationSizes() {
    // determining the presentationAreaWidth and presentationAreaHeight (available
    // space for the svg) on the initial load

    const presentationSizes = this.getPresentationSizesAvailable();
    if (Object.keys(presentationSizes).length > 0) {
      // setting the state of the available space for the svg
      // and set the showSlide to true to start rendering the slide
      this.setState({
        presentationAreaHeight: presentationSizes.presentationAreaHeight,
        presentationAreaWidth: presentationSizes.presentationAreaWidth,
        showSlide: true,
      });
    }
  }

  setFitToWidth(fitToWidth) {
    this.setState({ fitToWidth });
  }

  handleResize() {
    const presentationSizes = this.getPresentationSizesAvailable();
    if (Object.keys(presentationSizes).length > 0) {
      // updating the size of the space available for the slide
      this.setState({
        presentationAreaHeight: presentationSizes.presentationAreaHeight,
        presentationAreaWidth: presentationSizes.presentationAreaWidth,
      });
    }
  }

  calculateSize(viewBoxDimensions) {
    const {
      presentationAreaHeight,
      presentationAreaWidth,
      fitToWidth,
    } = this.state;

    const {
      userIsPresenter,
      currentSlide,
      slidePosition,
    } = this.props;

    if (!currentSlide || !slidePosition) {
      return { width: 0, height: 0 };
    }

    const originalWidth = slidePosition.width;
    const originalHeight = slidePosition.height;
    const viewBoxWidth = viewBoxDimensions.width;
    const viewBoxHeight = viewBoxDimensions.height;

    let svgWidth;
    let svgHeight;

    if (!userIsPresenter) {
      svgWidth = (presentationAreaHeight * viewBoxWidth) / viewBoxHeight;
      if (presentationAreaWidth < svgWidth) {
        svgHeight = (presentationAreaHeight * presentationAreaWidth) / svgWidth;
        svgWidth = presentationAreaWidth;
      } else {
        svgHeight = presentationAreaHeight;
      }
    } else if (!fitToWidth) {
      svgWidth = (presentationAreaHeight * originalWidth) / originalHeight;
      if (presentationAreaWidth < svgWidth) {
        svgHeight = (presentationAreaHeight * presentationAreaWidth) / svgWidth;
        svgWidth = presentationAreaWidth;
      } else {
        svgHeight = presentationAreaHeight;
      }
    } else {
      svgWidth = presentationAreaWidth;
      svgHeight = (svgWidth * originalHeight) / originalWidth;
      if (svgHeight > presentationAreaHeight) svgHeight = presentationAreaHeight;
    }

    return {
      width: svgWidth,
      height: svgHeight,
    };
  }

  zoomChanger(incomingZoom) {
    const {
      zoom,
    } = this.state;

    let newZoom = incomingZoom;

    if (newZoom <= HUNDRED_PERCENT) {
      newZoom = HUNDRED_PERCENT;
    } else if (incomingZoom >= MAX_PERCENT) {
      newZoom = MAX_PERCENT;
    }

    if (newZoom !== zoom) this.setState({ zoom: newZoom });
  }

  fitToWidthHandler() {
    const {
      fitToWidth,
    } = this.state;

    this.setState({
      fitToWidth: !fitToWidth,
      zoom: HUNDRED_PERCENT,
    });
  }

  isPresentationAccessible() {
    const {
      currentSlide,
      slidePosition,
    } = this.props;
    // sometimes tomcat publishes the slide url, but the actual file is not accessible
    return currentSlide && slidePosition;
  }

  updateLocalPosition(x, y, width, height, zoom) {
    this.setState({
      localPosition: {
        x, y, width, height,
      },
      zoom,
    });
  }

  panAndZoomChanger(w, h, x, y) {
    const {
      currentSlide,
      podId,
      zoomSlide,
    } = this.props;

    zoomSlide(currentSlide.num, podId, w, h, x, y);
  }

  renderPresentationClose() {
    const { isFullscreen } = this.state;
    if (!shouldEnableSwapLayout() || isFullscreen) {
      return null;
    }
    return <PresentationCloseButton toggleSwapLayout={MediaService.toggleSwapLayout} />;
  }

  renderOverlays(slideObj, svgDimensions, viewBoxPosition, viewBoxDimensions, physicalDimensions) {
    const {
      userIsPresenter,
      multiUser,
      podId,
      currentSlide,
      slidePosition,
    } = this.props;

    const {
      zoom,
      fitToWidth,
    } = this.state;

    if (!userIsPresenter && !multiUser) {
      return null;
    }

    // retrieving the pre-calculated data from the slide object
    const {
      width,
      height,
    } = slidePosition;

    return (
      <PresentationOverlayContainer
        podId={podId}
        userIsPresenter={userIsPresenter}
        currentSlideNum={currentSlide.num}
        slide={slideObj}
        slideWidth={width}
        slideHeight={height}
        viewBoxX={viewBoxPosition.x}
        viewBoxY={viewBoxPosition.y}
        viewBoxWidth={viewBoxDimensions.width}
        viewBoxHeight={viewBoxDimensions.height}
        physicalSlideWidth={physicalDimensions.width}
        physicalSlideHeight={physicalDimensions.height}
        svgWidth={svgDimensions.width}
        svgHeight={svgDimensions.height}
        zoom={zoom}
        zoomChanger={this.zoomChanger}
        updateLocalPosition={this.updateLocalPosition}
        panAndZoomChanger={this.panAndZoomChanger}
        getSvgRef={this.getSvgRef}
        fitToWidth={fitToWidth}
      >
        <WhiteboardOverlayContainer
          getSvgRef={this.getSvgRef}
          userIsPresenter={userIsPresenter}
          whiteboardId={slideObj.id}
          slide={slideObj}
          slideWidth={width}
          slideHeight={height}
          viewBoxX={viewBoxPosition.x}
          viewBoxY={viewBoxPosition.y}
          viewBoxWidth={viewBoxDimensions.width}
          viewBoxHeight={viewBoxDimensions.height}
          physicalSlideWidth={physicalDimensions.width}
          physicalSlideHeight={physicalDimensions.height}
          zoom={zoom}
          zoomChanger={this.zoomChanger}
        />
      </PresentationOverlayContainer>
    );
  }

  // renders the whole presentation area
  renderPresentationArea(svgDimensions, viewBoxDimensions) {
    const {
      intl,
      podId,
      currentSlide,
      slidePosition,
      userIsPresenter,
      layoutSwapped,
    } = this.props;

    const {
      localPosition,
    } = this.state;

    if (!this.isPresentationAccessible()) {
      return null;
    }

    // retrieving the pre-calculated data from the slide object
    const {
      width,
      height,
    } = slidePosition;

    const {
      imageUri,
      content,
    } = currentSlide;

    let viewBoxPosition;

    if (userIsPresenter && localPosition) {
      viewBoxPosition = {
        x: localPosition.x,
        y: localPosition.y,
      };
    } else {
      viewBoxPosition = {
        x: slidePosition.x,
        y: slidePosition.y,
      };
    }

    const widthRatio = viewBoxDimensions.width / width;
    const heightRatio = viewBoxDimensions.height / height;

    const physicalDimensions = {
      width: (svgDimensions.width / widthRatio),
      height: (svgDimensions.height / heightRatio),
    };

    const svgViewBox = `${viewBoxPosition.x} ${viewBoxPosition.y} `
      + `${viewBoxDimensions.width} ${Number.isNaN(viewBoxDimensions.height) ? 0 : viewBoxDimensions.height}`;

    const slideContent = content ? `${intl.formatMessage(intlMessages.slideContentStart)}
      ${content}
      ${intl.formatMessage(intlMessages.slideContentEnd)}` : intl.formatMessage(intlMessages.noSlideContent);

    return (
      <div
        style={{
          position: 'absolute',
          width: svgDimensions.width < 0 ? 0 : svgDimensions.width,
          height: svgDimensions.height < 0 ? 0 : svgDimensions.height,
          textAlign: 'center',
          display: layoutSwapped ? 'none' : 'block',
        }}
      >
        <span id="currentSlideText" className={styles.visuallyHidden}>{slideContent}</span>
        {this.renderPresentationClose()}
        {this.renderPresentationDownload()}
        {this.renderPresentationFullscreen()}
        <svg
          key={currentSlide.id}
          data-test="whiteboard"
          width={svgDimensions.width < 0 ? 0 : svgDimensions.width}
          height={svgDimensions.height < 0 ? 0 : svgDimensions.height}
          ref={(ref) => { if (ref != null) { this.svggroup = ref; } }}
          viewBox={svgViewBox}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.svgStyles}
        >
          <defs>
            <clipPath id="viewBox">
              <rect x={viewBoxPosition.x} y={viewBoxPosition.y} width="100%" height="100%" fill="none" />
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
              published
              whiteboardId={currentSlide.id}
            />
            <AnnotationGroupContainer
              {...{
                width,
                height,
              }}
              published={false}
              whiteboardId={currentSlide.id}
            />
            <CursorWrapperContainer
              podId={podId}
              whiteboardId={currentSlide.id}
              widthRatio={widthRatio}
              physicalWidthRatio={svgDimensions.width / width}
              slideWidth={width}
              slideHeight={height}
            />
          </g>
          {this.renderOverlays(
            currentSlide,
            svgDimensions,
            viewBoxPosition,
            viewBoxDimensions,
            physicalDimensions,
          )}
        </svg>
      </div>
    );
  }

  renderPresentationToolbar() {
    const {
      currentSlide,
      podId,
    } = this.props;

    const { zoom, fitToWidth, isFullscreen } = this.state;

    if (!currentSlide) {
      return null;
    }

    return (
      <PresentationToolbarContainer
        {...{
          fitToWidth,
          zoom,
          podId,
          currentSlide,
        }}
        isFullscreen={isFullscreen}
        fullscreenRef={this.refPresentationContainer}
        currentSlideNum={currentSlide.num}
        presentationId={currentSlide.presentationId}
        zoomChanger={this.zoomChanger}
        fitToWidthHandler={this.fitToWidthHandler}
      />
    );
  }

  renderWhiteboardToolbar(svgDimensions) {
    const { currentSlide } = this.props;
    if (!this.isPresentationAccessible()) return null;

    return (
      <WhiteboardToolbarContainer
        whiteboardId={currentSlide.id}
        height={svgDimensions.height}
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

  renderPresentationFullscreen() {
    const {
      intl,
      userIsPresenter,
    } = this.props;
    const { isFullscreen } = this.state;

    if (userIsPresenter || !ALLOW_FULLSCREEN) return null;

    return (
      <FullscreenButtonContainer
        fullscreenRef={this.refPresentationContainer}
        elementName={intl.formatMessage(intlMessages.presentationLabel)}
        isFullscreen={isFullscreen}
        dark
        bottom
      />
    );
  }

  renderCurrentPresentationToast() {
    const {
      intl, currentPresentation, userIsPresenter, downloadPresentationUri,
    } = this.props;
    const { downloadable } = currentPresentation;

    return (
      <div className={styles.innerToastWrapper}>
        <div className={styles.toastIcon}>
          <div className={styles.iconWrapper}>
            <Icon iconName="presentation" />
          </div>
        </div>

        <div className={styles.toastTextContent} data-test="toastSmallMsg">
          <div>{`${intl.formatMessage(intlMessages.changeNotification)}`}</div>
          <div className={styles.presentationName}>{`${currentPresentation.name}`}</div>
        </div>

        {downloadable && !userIsPresenter
          ? (
            <span className={styles.toastDownload}>
              <div className={toastStyles.separator} />
              <a
                className={styles.downloadBtn}
                aria-label={`${intl.formatMessage(intlMessages.downloadLabel)} ${currentPresentation.name}`}
                href={downloadPresentationUri}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.formatMessage(intlMessages.downloadLabel)}
              </a>
            </span>
          ) : null
        }
      </div>
    );
  }

  render() {
    const {
      userIsPresenter,
      multiUser,
      slidePosition,
    } = this.props;

    const {
      showSlide,
      // fitToWidth,
      // presentationAreaWidth,
      localPosition,
    } = this.state;

    let viewBoxDimensions;

    if (userIsPresenter && localPosition) {
      viewBoxDimensions = {
        width: localPosition.width,
        height: localPosition.height,
      };
    } else if (slidePosition) {
      viewBoxDimensions = {
        width: slidePosition.viewBoxWidth,
        height: slidePosition.viewBoxHeight,
      };
    } else {
      viewBoxDimensions = {
        width: 0,
        height: 0,
      };
    }

    const svgDimensions = this.calculateSize(viewBoxDimensions);
    const svgHeight = svgDimensions.height;
    const svgWidth = svgDimensions.width;

    const toolbarHeight = this.getToolbarHeight();

    let toolbarWidth = 0;
    if (this.refWhiteboardArea) {
      toolbarWidth = svgWidth;
    }

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
          <div
            className={styles.svgContainer}
            style={{
              height: svgHeight + toolbarHeight,
            }}
          >
            {showSlide
              ? this.renderPresentationArea(svgDimensions, viewBoxDimensions)
              : null}
            {showSlide && (userIsPresenter || multiUser)
              ? this.renderWhiteboardToolbar(svgDimensions)
              : null}
            {showSlide && userIsPresenter
              ? (
                <div
                  className={styles.presentationToolbar}
                  ref={(ref) => { this.refPresentationToolbar = ref; }}
                  style={
                    {
                      width: toolbarWidth,
                    }
                  }
                >
                  {this.renderPresentationToolbar()}
                </div>
              )
              : null}
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(withDraggableConsumer(withLayoutConsumer(PresentationArea)));

PresentationArea.propTypes = {
  intl: intlShape.isRequired,
  podId: PropTypes.string.isRequired,
  // Defines a boolean value to detect whether a current user is a presenter
  userIsPresenter: PropTypes.bool.isRequired,
  currentSlide: PropTypes.shape({
    presentationId: PropTypes.string.isRequired,
    current: PropTypes.bool.isRequired,
    num: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    imageUri: PropTypes.string.isRequired,
  }),
  slidePosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    viewBoxWidth: PropTypes.number.isRequired,
    viewBoxHeight: PropTypes.number.isRequired,
  }),
  // current multi-user status
  multiUser: PropTypes.bool.isRequired,
};

PresentationArea.defaultProps = {
  currentSlide: undefined,
  slidePosition: undefined,
};
