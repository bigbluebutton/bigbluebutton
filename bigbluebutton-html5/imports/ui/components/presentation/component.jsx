import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import WhiteboardContainer from '/imports/ui/components/whiteboard/container';
import { HUNDRED_PERCENT, MAX_PERCENT } from '/imports/utils/slideCalcUtils';
import { SPACE } from '/imports/utils/keyCodes';
import { defineMessages, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { Session } from 'meteor/session';
import PresentationToolbarContainer from './presentation-toolbar/container';
import PresentationMenu from './presentation-menu/container';
import Styled from './styles';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import Icon from '/imports/ui/components/common/icon/component';
import PollingContainer from '/imports/ui/components/polling/container';
import { ACTIONS, LAYOUT_TYPE } from '../layout/enums';
import DEFAULT_VALUES from '../layout/defaultValues';
import { colorContentBackground } from '/imports/ui/stylesheets/styled-components/palette';
import browserInfo from '/imports/utils/browserInfo';
import { addNewAlert } from '../screenreader-alert/service';
import { clearCursors } from '/imports/ui/components/whiteboard/cursors/service';

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
  slideContentChanged: {
    id: 'app.presentation.changedSlideContent',
    description: 'Indicate the slide content has changed',
  },
  noSlideContent: {
    id: 'app.presentation.emptySlideContent',
    description: 'No content available for slide',
  },
});

const { isSafari } = browserInfo;
const FULLSCREEN_CHANGE_EVENT = isSafari ? 'webkitfullscreenchange' : 'fullscreenchange';

const getToolbarHeight = () => {
  let height = 0;
  const toolbarEl = document.getElementById('presentationToolbarWrapper');
  if (toolbarEl) {
    const { clientHeight } = toolbarEl;
    height = clientHeight;
  }
  return height;
};

class Presentation extends PureComponent {
  constructor() {
    super();

    this.state = {
      presentationWidth: 0,
      presentationHeight: 0,
      zoom: 100,
      fitToWidth: false,
      isFullscreen: false,
      tldrawAPI: null,
      isPanning: false,
      tldrawIsMounting: true,
      isToolbarVisible: true,
      hadPresentation: false,
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
    this.setTldrawAPI = this.setTldrawAPI.bind(this);
    this.setIsPanning = this.setIsPanning.bind(this);
    this.setIsToolbarVisible = this.setIsToolbarVisible.bind(this);
    this.handlePanShortcut = this.handlePanShortcut.bind(this);
    this.renderPresentationMenu = this.renderPresentationMenu.bind(this);

    this.onResize = () => setTimeout(this.handleResize.bind(this), 0);
    this.renderCurrentPresentationToast = this.renderCurrentPresentationToast.bind(this);
    this.setPresentationRef = this.setPresentationRef.bind(this);
    this.setTldrawIsMounting = this.setTldrawIsMounting.bind(this);
    Session.set('componentPresentationWillUnmount', false);
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
    if (prevProps.currentSlide?.id !== props.currentSlide?.id
      || prevProps.userIsPresenter !== props.userIsPresenter) {
      stateChange.localPosition = undefined;
    }

    return stateChange;
  }

  componentDidMount() {
    this.getInitialPresentationSizes();
    this.refPresentationContainer.addEventListener('keydown', this.handlePanShortcut);
    this.refPresentationContainer.addEventListener('keyup', this.handlePanShortcut);
    this.refPresentationContainer
      .addEventListener(FULLSCREEN_CHANGE_EVENT, this.onFullscreenChange);
    window.addEventListener('resize', this.onResize, false);

    const {
      currentSlide, slidePosition, numPages, layoutContextDispatch, currentPresentationId,
    } = this.props;

    if (currentPresentationId) {
      this.setState({
        hadPresentation: true
      });
    }

    if (currentSlide) {
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_NUM_CURRENT_SLIDE,
        value: currentSlide.num,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_CURRENT_SLIDE_SIZE,
        value: {
          width: slidePosition.width,
          height: slidePosition.height,
        },
      });
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_SLIDES_LENGTH,
        value: numPages,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      currentPresentation,
      slidePosition,
      presentationIsOpen,
      currentSlide,
      publishedPoll,
      setPresentationIsOpen,
      restoreOnUpdate,
      layoutContextDispatch,
      userIsPresenter,
      presentationBounds,
      numCameras,
      intl,
      multiUser,
      numPages,
      currentPresentationId,
    } = this.props;

    const {
      presentationWidth, presentationHeight, zoom, isPanning, fitToWidth, presentationId, hadPresentation,
    } = this.state;
    const {
      numCameras: prevNumCameras,
      presentationBounds: prevPresentationBounds,
      multiUser: prevMultiUser,
    } = prevProps;

    if (prevMultiUser && !multiUser) {
      clearCursors();
    }

    if (numCameras !== prevNumCameras) {
      this.onResize();
    }

    if (numPages !== prevProps.numPages) {
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_SLIDES_LENGTH,
        value: numPages,
      });
    }

    if (
      currentSlide?.num != null
      && prevProps?.currentSlide?.num != null
      && currentSlide?.num !== prevProps.currentSlide?.num
    ) {
      addNewAlert(intl.formatMessage(intlMessages.slideContentChanged, { 0: currentSlide.num }));
    }

    if (currentPresentation) {
      const downloadableOn = !prevProps?.currentPresentation?.downloadable
        && currentPresentation.downloadable;

      const shouldCloseToast = !(currentPresentation.downloadable && !userIsPresenter);

      if (
        prevProps?.currentPresentation?.id !== currentPresentation.id
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
            className: 'actionToast currentPresentationToast',
          });
        }
      }

      const downloadableOff = prevProps?.currentPresentation?.downloadable
        && !currentPresentation.downloadable;

      if (this.currentPresentationToastId && downloadableOff) {
        toast.update(this.currentPresentationToastId, {
          autoClose: true,
          render: this.renderCurrentPresentationToast(),
        });
      }
    }

    if (prevProps?.slidePosition && slidePosition) {
      const { width: prevWidth, height: prevHeight } = prevProps.slidePosition;
      const { width: currWidth, height: currHeight } = slidePosition;

      if (prevWidth !== currWidth || prevHeight !== currHeight) {
        layoutContextDispatch({
          type: ACTIONS.SET_PRESENTATION_CURRENT_SLIDE_SIZE,
          value: {
            width: currWidth,
            height: currHeight,
          },
        });
      }
      const presentationChanged = presentationId !== currentPresentationId;

      const isInitialPresentation = currentPresentation.isInitialPresentation;

      if (!presentationIsOpen && restoreOnUpdate && (currentSlide || presentationChanged)) {
        const slideChanged = currentSlide.id !== prevProps.currentSlide.id;
        const positionChanged = slidePosition
          .viewBoxHeight !== prevProps.slidePosition.viewBoxHeight
          || slidePosition.viewBoxWidth !== prevProps.slidePosition.viewBoxWidth;
        const pollPublished = publishedPoll && !prevProps.publishedPoll;
        if (slideChanged || positionChanged || pollPublished || (presentationChanged && (hadPresentation || !isInitialPresentation))) {
          setPresentationIsOpen(layoutContextDispatch, !presentationIsOpen);
        }
      }

      if (presentationChanged) {
        this.setState({
          presentationId: currentPresentationId,
          hadPresentation: true
        });
      }

      if ((presentationBounds !== prevPresentationBounds)
        || (!presentationWidth && !presentationHeight)) this.onResize();
    } else if (slidePosition) {
      const { width: currWidth, height: currHeight } = slidePosition;

      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_CURRENT_SLIDE_SIZE,
        value: {
          width: currWidth,
          height: currHeight,
        },
      });
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_NUM_CURRENT_SLIDE,
        value: currentSlide.num,
      });
    }

    if ((zoom <= HUNDRED_PERCENT && isPanning && !fitToWidth)
      || (!userIsPresenter && prevProps.userIsPresenter)) {
      this.setIsPanning();
    }
  }

  componentWillUnmount() {
    Session.set('componentPresentationWillUnmount', true);
    const { fullscreenContext, layoutContextDispatch } = this.props;

    window.removeEventListener('resize', this.onResize, false);
    this.refPresentationContainer
      .removeEventListener(FULLSCREEN_CHANGE_EVENT, this.onFullscreenChange);
    this.refPresentationContainer.removeEventListener('keydown', this.handlePanShortcut);
    this.refPresentationContainer.removeEventListener('keyup', this.handlePanShortcut);

    if (fullscreenContext) {
      layoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: '',
          group: '',
        },
      });
    }
  }

  handlePanShortcut(e) {
    const { userIsPresenter } = this.props;
    const { isPanning } = this.state;
    if (e.keyCode === SPACE && userIsPresenter) {
      switch (e.type) {
        case 'keyup':
          return isPanning && this.setIsPanning();
        case 'keydown':
          return !isPanning && this.setIsPanning();
        default:
      }
    }
    return null;
  }

  handleResize() {
    const presentationSizes = this.getPresentationSizesAvailable();
    if (Object.keys(presentationSizes).length > 0) {
      // updating the size of the space available for the slide
      if (!Session.get('componentPresentationWillUnmount')) {
        this.setState({
          presentationHeight: presentationSizes.presentationHeight,
          presentationWidth: presentationSizes.presentationWidth,
        });
      }
    }
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(this.refPresentationContainer);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
    }
  }

  setTldrawAPI(api) {
    this.setState({
      tldrawAPI: api,
    });
  }

  setTldrawIsMounting(value) {
    this.setState({ tldrawIsMounting: value });
  }

  setIsPanning() {
    this.setState((prevState) => ({
      isPanning: !prevState.isPanning,
    }));
  }

  setIsToolbarVisible(isVisible) {
    this.setState({
      isToolbarVisible: isVisible,
    });
  }

  setPresentationRef(ref) {
    this.refPresentationContainer = ref;
  }

  // returns a ref to the svg element, which is required by a WhiteboardOverlay
  // to transform screen coordinates to svg coordinate system
  getSvgRef() {
    return this.svggroup;
  }

  getPresentationSizesAvailable() {
    const {
      presentationBounds,
      presentationAreaSize: newPresentationAreaSize,
    } = this.props;
    const presentationSizes = {
      presentationWidth: 0,
      presentationHeight: 0,
    };

    if (newPresentationAreaSize) {
      presentationSizes.presentationWidth = newPresentationAreaSize.presentationAreaWidth;
      presentationSizes.presentationHeight = newPresentationAreaSize
        .presentationAreaHeight - (getToolbarHeight() || 0);
      return presentationSizes;
    }

    presentationSizes.presentationWidth = presentationBounds.width;
    presentationSizes.presentationHeight = presentationBounds.height;
    return presentationSizes;
  }

  getInitialPresentationSizes() {
    // determining the presentationWidth and presentationHeight (available
    // space for the svg) on the initial load

    const presentationSizes = this.getPresentationSizesAvailable();
    if (Object.keys(presentationSizes).length > 0) {
      // setting the state of the available space for the svg
      this.setState({
        presentationHeight: presentationSizes.presentationHeight,
        presentationWidth: presentationSizes.presentationWidth,
      });
    }
  }

  setFitToWidth(fitToWidth) {
    this.setState({ fitToWidth });
  }

  zoomChanger(zoom) {
    this.setState({ zoom });
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

  updateLocalPosition(x, y, width, height, zoom) {
    this.setState({
      localPosition: {
        x, y, width, height,
      },
      zoom,
    });
  }

  calculateSize(viewBoxDimensions) {
    const {
      presentationHeight,
      presentationWidth,
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
      svgWidth = (presentationHeight * viewBoxWidth) / viewBoxHeight;
      if (presentationWidth < svgWidth) {
        svgHeight = (presentationHeight * presentationWidth) / svgWidth;
        svgWidth = presentationWidth;
      } else {
        svgHeight = presentationHeight;
      }
    } else if (!fitToWidth) {
      svgWidth = (presentationHeight * originalWidth) / originalHeight;
      if (presentationWidth < svgWidth) {
        svgHeight = (presentationHeight * presentationWidth) / svgWidth;
        svgWidth = presentationWidth;
      } else {
        svgHeight = presentationHeight;
      }
    } else {
      svgWidth = presentationWidth;
      svgHeight = (svgWidth * originalHeight) / originalWidth;
      if (svgHeight > presentationHeight) svgHeight = presentationHeight;
    }

    if (typeof svgHeight !== 'number' || typeof svgWidth !== 'number') {
      return { width: 0, height: 0 };
    }

    return {
      width: svgWidth,
      height: svgHeight,
    };
  }

  panAndZoomChanger(w, h, x, y) {
    const {
      currentSlide,
      podId,
      zoomSlide,
    } = this.props;

    zoomSlide(currentSlide.num, podId, w, h, x, y);
  }

  renderPresentationToolbar(svgWidth = 0) {
    const {
      currentSlide,
      podId,
      isMobile,
      layoutType,
      numCameras,
      fullscreenElementId,
      fullscreenContext,
      layoutContextDispatch,
      presentationIsOpen,
      slidePosition,
      addWhiteboardGlobalAccess,
      removeWhiteboardGlobalAccess,
      multiUserSize,
      multiUser,
    } = this.props;
    const {
      zoom, fitToWidth, isPanning,
    } = this.state;

    if (!currentSlide) return null;

    const { presentationToolbarMinWidth } = DEFAULT_VALUES;

    const toolbarWidth = ((this.refWhiteboardArea && svgWidth > presentationToolbarMinWidth)
      || isMobile
      || (layoutType === LAYOUT_TYPE.VIDEO_FOCUS && numCameras > 0))
      ? svgWidth
      : presentationToolbarMinWidth;
    return (
      <PresentationToolbarContainer
        {...{
          fitToWidth,
          zoom,
          podId,
          currentSlide,
          slidePosition,
          toolbarWidth,
          fullscreenElementId,
          layoutContextDispatch,
          presentationIsOpen,
        }}
        setIsPanning={this.setIsPanning}
        isPanning={isPanning}
        currentSlideNum={currentSlide.num}
        presentationId={currentSlide.presentationId}
        zoomChanger={this.zoomChanger}
        fitToWidthHandler={this.fitToWidthHandler}
        isFullscreen={fullscreenContext}
        fullscreenAction={ACTIONS.SET_FULLSCREEN_ELEMENT}
        fullscreenRef={this.refPresentationContainer}
        addWhiteboardGlobalAccess={addWhiteboardGlobalAccess}
        removeWhiteboardGlobalAccess={removeWhiteboardGlobalAccess}
        multiUserSize={multiUserSize}
        multiUser={multiUser}
        whiteboardId={currentSlide?.id}
      />
    );
  }

  renderCurrentPresentationToast() {
    const {
      intl, currentPresentation, userIsPresenter, downloadPresentationUri,
    } = this.props;
    const { downloadable } = currentPresentation;

    return (
      <Styled.InnerToastWrapper data-test="currentPresentationToast">
        <Styled.ToastIcon>
          <Styled.IconWrapper>
            <Icon iconName="presentation" />
          </Styled.IconWrapper>
        </Styled.ToastIcon>

        <Styled.ToastTextContent data-test="toastSmallMsg">
          <div>{`${intl.formatMessage(intlMessages.changeNotification)}`}</div>
          <Styled.PresentationName>{`${currentPresentation.name}`}</Styled.PresentationName>
        </Styled.ToastTextContent>

        {downloadable && !userIsPresenter
          ? (
            <Styled.ToastDownload>
              <Styled.ToastSeparator />
              <a
                data-test="toastDownload"
                aria-label={`${intl.formatMessage(intlMessages.downloadLabel)} ${currentPresentation.name}`}
                href={downloadPresentationUri}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.formatMessage(intlMessages.downloadLabel)}
              </a>
            </Styled.ToastDownload>
          ) : null}
      </Styled.InnerToastWrapper>
    );
  }

  renderPresentationMenu() {
    const {
      intl,
      fullscreenElementId,
      layoutContextDispatch,
    } = this.props;
    const { tldrawAPI, isToolbarVisible } = this.state;

    return (
      <PresentationMenu
        fullscreenRef={this.refPresentationContainer}
        tldrawAPI={tldrawAPI}
        elementName={intl.formatMessage(intlMessages.presentationLabel)}
        elementId={fullscreenElementId}
        layoutContextDispatch={layoutContextDispatch}
        setIsToolbarVisible={this.setIsToolbarVisible}
        isToolbarVisible={isToolbarVisible}
      />
    );
  }

  render() {
    const {
      userIsPresenter,
      currentSlide,
      slidePosition,
      presentationBounds,
      fullscreenContext,
      isMobile,
      layoutType,
      numCameras,
      currentPresentation,
      podId,
      intl,
      isViewersCursorLocked,
      fullscreenElementId,
      layoutContextDispatch,
      presentationIsOpen,
      darkTheme,
    } = this.props;

    const {
      isFullscreen,
      localPosition,
      fitToWidth,
      zoom,
      tldrawIsMounting,
      isPanning,
      tldrawAPI,
      isToolbarVisible,
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

    const toolbarHeight = getToolbarHeight();

    const { presentationToolbarMinWidth } = DEFAULT_VALUES;

    const isLargePresentation = (svgWidth > presentationToolbarMinWidth || isMobile)
      && !(layoutType === LAYOUT_TYPE.VIDEO_FOCUS && numCameras > 0 && !fullscreenContext);

    const containerWidth = isLargePresentation
      ? svgWidth
      : presentationToolbarMinWidth;

    const slideContent = currentSlide?.content ? `${intl.formatMessage(intlMessages.slideContentStart)}
    ${currentSlide.content}
    ${intl.formatMessage(intlMessages.slideContentEnd)}` : intl.formatMessage(intlMessages.noSlideContent);

    return (
      <>
        <Styled.PresentationContainer
          role="region"
          data-test="presentationContainer"
          ref={(ref) => { this.refPresentationContainer = ref; }}
          style={{
            top: presentationBounds.top,
            left: presentationBounds.left,
            right: presentationBounds.right,
            width: presentationBounds.width,
            height: presentationBounds.height,
            display: !presentationIsOpen ? 'none' : 'flex',
            overflow: 'hidden',
            zIndex: fullscreenContext ? presentationBounds.zIndex : undefined,
            background:
              layoutType === LAYOUT_TYPE.VIDEO_FOCUS && numCameras > 0 && !fullscreenContext
                ? colorContentBackground
                : null,
          }}
        >
          <Styled.Presentation ref={(ref) => { this.refPresentation = ref; }}>
            <Styled.SvgContainer
              style={{
                height: svgHeight + toolbarHeight,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: svgDimensions.width < 0 ? 0 : svgDimensions.width,
                  height: svgDimensions.height < 0 ? 0 : svgDimensions.height,
                  textAlign: 'center',
                  display: !presentationIsOpen ? 'none' : 'block',
                }}
                id="presentationInnerWrapper"
              >
                <Styled.VisuallyHidden id="currentSlideText">{slideContent}</Styled.VisuallyHidden>
                {!tldrawIsMounting && currentSlide && this.renderPresentationMenu()}
                <WhiteboardContainer
                  whiteboardId={currentSlide?.id}
                  podId={podId}
                  slidePosition={slidePosition}
                  getSvgRef={this.getSvgRef}
                  tldrawAPI={tldrawAPI}
                  setTldrawAPI={this.setTldrawAPI}
                  curPageId={currentSlide?.num.toString() || '0'}
                  svgUri={currentSlide?.svgUri}
                  intl={intl}
                  presentationWidth={svgWidth}
                  presentationHeight={svgHeight}
                  presentationAreaHeight={presentationBounds?.height}
                  presentationAreaWidth={presentationBounds?.width}
                  isViewersCursorLocked={isViewersCursorLocked}
                  isPanning={isPanning}
                  zoomChanger={this.zoomChanger}
                  fitToWidth={fitToWidth}
                  zoomValue={zoom}
                  setTldrawIsMounting={this.setTldrawIsMounting}
                  isFullscreen={isFullscreen}
                  fullscreenAction={ACTIONS.SET_FULLSCREEN_ELEMENT}
                  fullscreenElementId={fullscreenElementId}
                  layoutContextDispatch={layoutContextDispatch}
                  fullscreenRef={this.refPresentationContainer}
                  presentationId={currentPresentation?.id}
                  darkTheme={darkTheme}
                  isToolbarVisible={isToolbarVisible}
                />
                {isFullscreen && <PollingContainer />}
              </div>
              {!tldrawIsMounting && (
                <Styled.PresentationToolbar
                  ref={(ref) => { this.refPresentationToolbar = ref; }}
                  style={
                    {
                      width: containerWidth,
                    }
                  }
                >
                  {this.renderPresentationToolbar(svgWidth)}
                </Styled.PresentationToolbar>
              )}
            </Styled.SvgContainer>
          </Styled.Presentation>
        </Styled.PresentationContainer>

      </>
    );
  }
}

export default injectIntl(Presentation);

Presentation.propTypes = {
  podId: PropTypes.string.isRequired,
  // Defines a boolean value to detect whether a current user is a presenter
  userIsPresenter: PropTypes.bool.isRequired,
  currentSlide: PropTypes.shape({
    presentationId: PropTypes.string.isRequired,
    current: PropTypes.bool.isRequired,
    num: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    imageUri: PropTypes.string.isRequired,
    curPageId: PropTypes.string,
    svgUri: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
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
  setPresentationIsOpen: PropTypes.func.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  currentPresentation: PropTypes.shape({
    downloadable: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  presentationIsOpen: PropTypes.bool.isRequired,
  numPages: PropTypes.number.isRequired,
  publishedPoll: PropTypes.bool.isRequired,
  presentationBounds: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    zIndex: PropTypes.number,
  }),
  restoreOnUpdate: PropTypes.bool.isRequired,
  numCameras: PropTypes.number.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isMobile: PropTypes.bool.isRequired,
  fullscreenContext: PropTypes.bool.isRequired,
  presentationAreaSize: PropTypes.shape({
    presentationAreaWidth: PropTypes.number.isRequired,
    presentationAreaHeight: PropTypes.number.isRequired,
  }),
  zoomSlide: PropTypes.func.isRequired,
  addWhiteboardGlobalAccess: PropTypes.func.isRequired,
  removeWhiteboardGlobalAccess: PropTypes.func.isRequired,
  multiUserSize: PropTypes.number.isRequired,
  layoutType: PropTypes.string.isRequired,
  fullscreenElementId: PropTypes.string.isRequired,
  downloadPresentationUri: PropTypes.string,
  isViewersCursorLocked: PropTypes.bool.isRequired,
  darkTheme: PropTypes.bool.isRequired,
};

Presentation.defaultProps = {
  currentSlide: undefined,
  slidePosition: undefined,
  currentPresentation: undefined,
  presentationAreaSize: undefined,
  presentationBounds: undefined,
  downloadPresentationUri: undefined,
};
