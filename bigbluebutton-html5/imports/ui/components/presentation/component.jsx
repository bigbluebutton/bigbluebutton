import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import WhiteboardOverlayContainer from '/imports/ui/components/whiteboard/whiteboard-overlay/container'
import WhiteboardContainer from '/imports/ui/components/whiteboard/container';
import WhiteboardToolbarContainer from '/imports/ui/components/whiteboard/whiteboard-toolbar/container';
import { HUNDRED_PERCENT, MAX_PERCENT } from '/imports/utils/slideCalcUtils';
import { SPACE } from '/imports/utils/keyCodes';
import { defineMessages, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { Session } from 'meteor/session';
import PresentationToolbarContainer from './presentation-toolbar/container';
import PresentationMenu from './presentation-menu/container';
import CursorWrapperContainer from './cursor/cursor-wrapper-container/container';
import AnnotationGroupContainer from '../whiteboard/annotation-group/container';
import PresentationOverlayContainer from './presentation-overlay/container';
import Slide from './slide/component';
import Styled from './styles';
import DownloadPresentationButton from './download-presentation-button/component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import Icon from '/imports/ui/components/common/icon/component';
import PollingContainer from '/imports/ui/components/polling/container';
import { ACTIONS, LAYOUT_TYPE } from '../layout/enums';
import DEFAULT_VALUES from '../layout/defaultValues';
import { colorContentBackground } from '/imports/ui/stylesheets/styled-components/palette';
import browserInfo from '/imports/utils/browserInfo';
import { addNewAlert } from '../screenreader-alert/service';
import { clearCursors } from '/imports/ui/components/cursor/service';

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

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;
const OLD_MINIMIZE_BUTTON_ENABLED = Meteor.settings.public.presentation.oldMinimizeButton;
const { isSafari } = browserInfo;
const FULLSCREEN_CHANGE_EVENT = isSafari ? 'webkitfullscreenchange' : 'fullscreenchange';

class Presentation extends PureComponent {
  constructor() {
    super();

    this.state = {
      presentationWidth: 0,
      presentationHeight: 0,
      showSlide: false,
      zoom: 100,
      fitToWidth: false,
      isFullscreen: false,
      tldrawAPI: null,
      isPanning: false,
      tldrawIsMounting: true,
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

  setIsPanning() {
    this.setState({
      isPanning: !this.state.isPanning,
    });
  }

  handlePanShortcut(e) {
    const { userIsPresenter } = this.props;
    if (e.keyCode === SPACE && userIsPresenter) {
      switch(e.type) {
        case 'keyup':
          return this.state.isPanning && this.setIsPanning();
        case 'keydown':
          return !this.state.isPanning && this.setIsPanning(); 
      }
    }
  }

  componentDidMount() {
    this.getInitialPresentationSizes();
    this.refPresentationContainer.addEventListener('keydown', this.handlePanShortcut);
    this.refPresentationContainer.addEventListener('keyup', this.handlePanShortcut);
    this.refPresentationContainer
      .addEventListener(FULLSCREEN_CHANGE_EVENT, this.onFullscreenChange);
    window.addEventListener('resize', this.onResize, false);

    const {
      currentSlide, slidePosition, layoutContextDispatch,
    } = this.props;

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
    }
  }

  componentDidUpdate(prevProps) {
    const {
      currentPresentation,
      slidePosition,
      presentationIsOpen,
      currentSlide,
      publishedPoll,
      isViewer,
      setPresentationIsOpen,
      restoreOnUpdate,
      layoutContextDispatch,
      userIsPresenter,
      presentationBounds,
      numCameras,
      intl,
      multiUser,
      clearFakeAnnotations,
    } = this.props;

    const { presentationWidth, presentationHeight, zoom, isPanning, fitToWidth } = this.state;
    const {
      numCameras: prevNumCameras,
      presentationBounds: prevPresentationBounds,
      multiUser: prevMultiUser,
    } = prevProps;

    if (prevMultiUser && !multiUser) {
      clearFakeAnnotations();
      clearCursors();
    }

    if (numCameras !== prevNumCameras) {
      this.onResize();
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

    if (!prevProps.currentPresentation && currentPresentation && !presentationIsOpen) {
      setPresentationIsOpen(layoutContextDispatch, true);
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

      if (!presentationIsOpen && restoreOnUpdate && !userIsPresenter && currentSlide) {
        const slideChanged = currentSlide.id !== prevProps.currentSlide.id;
        const positionChanged = slidePosition
          .viewBoxHeight !== prevProps.slidePosition.viewBoxHeight
          || slidePosition.viewBoxWidth !== prevProps.slidePosition.viewBoxWidth;
        const pollPublished = publishedPoll && !prevProps.publishedPoll;
        if (slideChanged || positionChanged || pollPublished) {
          setPresentationIsOpen(layoutContextDispatch, !presentationIsOpen);
        }
      }

      if ((presentationBounds !== prevPresentationBounds) ||
        (!presentationWidth && !presentationHeight)) this.onResize();
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

    if ((zoom <= HUNDRED_PERCENT && isPanning && !fitToWidth) || !userIsPresenter && prevProps.userIsPresenter) {
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

  setTldrawAPI(api) {
    this.setState({
      tldrawAPI: api,
    });
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

  setPresentationRef(ref) {
    this.refPresentationContainer = ref;
  }

  // returns a ref to the svg element, which is required by a WhiteboardOverlay
  // to transform screen coordinates to svg coordinate system
  getSvgRef() {
    return this.svggroup;
  }

  getToolbarHeight() {
    let height = 0;
    const toolbarEl = document.getElementById('presentationToolbarWrapper');
    if (toolbarEl) {
      const { clientHeight } = toolbarEl;
      height = clientHeight;
    }
    return height;
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
        .presentationAreaHeight - (this.getToolbarHeight() || 0);
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
      // and set the showSlide to true to start rendering the slide
      this.setState({
        presentationHeight: presentationSizes.presentationHeight,
        presentationWidth: presentationSizes.presentationWidth,
        showSlide: true,
      });
    }
  }

  setFitToWidth(fitToWidth) {
    this.setState({ fitToWidth });
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
    const {
      layoutType,
      fullscreenContext,
    } = this.props;

    if (!OLD_MINIMIZE_BUTTON_ENABLED
      || !shouldEnableSwapLayout()
      || isFullscreen
      || fullscreenContext
      || layoutType === LAYOUT_TYPE.PRESENTATION_FOCUS) {
      return null;
    }
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
  renderPresentation(svgDimensions, viewBoxDimensions) {
    const {
      intl,
      podId,
      currentSlide,
      slidePosition,
      userIsPresenter,
      presentationIsOpen,
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
          display: !presentationIsOpen ? 'none' : 'block',
        }}
      >
        <Styled.VisuallyHidden id="currentSlideText">{slideContent}</Styled.VisuallyHidden>
        {/* {this.renderPresentationClose()}
        {this.renderPresentationDownload()}
        {this.renderPresentationFullscreen()} */}
        {this.renderPresentationMenu()}
        <Styled.PresentationSvg
          key={currentSlide.id}
          data-test={!presentationIsOpen ? 'hiddenWhiteboard' : 'whiteboard'}
          width={svgDimensions.width < 0 ? 0 : svgDimensions.width}
          height={svgDimensions.height < 0 ? 0 : svgDimensions.height}
          ref={(ref) => { if (ref != null) { this.svggroup = ref; } }}
          viewBox={svgViewBox}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
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
        </Styled.PresentationSvg>
      </div>
    );
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
    } = this.props;
    const { zoom, fitToWidth } = this.state;

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
        isPanning={this.state.isPanning}
        curPageId={this.state.tldrawAPI?.getPage()?.id}
        currentSlideNum={currentSlide.num}
        presentationId={currentSlide.presentationId}
        zoomChanger={this.zoomChanger}
        fitToWidthHandler={this.fitToWidthHandler}
        isFullscreen={fullscreenContext}
        fullscreenAction={ACTIONS.SET_FULLSCREEN_ELEMENT}
        fullscreenRef={this.refPresentationContainer}
        addWhiteboardGlobalAccess={this.props.addWhiteboardGlobalAccess}
        removeWhiteboardGlobalAccess={this.props.removeWhiteboardGlobalAccess}
        multiUserSize={this.props.multiUserSize}
        multiUser={this.props.multiUser}
        whiteboardId={currentSlide?.id}
      />
    );
  }

  renderWhiteboardToolbar(svgDimensions) {
    const { currentSlide, userIsPresenter } = this.props;
    if (!this.isPresentationAccessible()) return null;

    return (
      <WhiteboardToolbarContainer
        whiteboardId={currentSlide.id}
        height={svgDimensions.height}
        isPresenter={userIsPresenter}
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
      fullscreenElementId,
    } = this.props;
    const { isFullscreen } = this.state;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <Styled.PresentationFullscreenButton
        fullscreenRef={this.refPresentationContainer}
        elementName={intl.formatMessage(intlMessages.presentationLabel)}
        elementId={fullscreenElementId}
        isFullscreen={isFullscreen}
        color="muted"
        fullScreenStyle={false}
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

    return (
      <PresentationMenu
        fullscreenRef={this.refPresentationContainer}
        tldrawAPI={this.state.tldrawAPI}
        elementName={intl.formatMessage(intlMessages.presentationLabel)}
        elementId={fullscreenElementId}
        layoutContextDispatch={layoutContextDispatch}
      />
    );
  }

  setTldrawIsMounting(value) {
    this.setState({ tldrawIsMounting: value });
  }

  render() {
    const {
      userIsPresenter,
      currentSlide,
      multiUser,
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
      showSlide,
      isFullscreen,
      localPosition,
      fitToWidth,
      zoom,
      tldrawIsMounting,
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

    const { presentationToolbarMinWidth } = DEFAULT_VALUES;

    const isLargePresentation = (svgWidth > presentationToolbarMinWidth || isMobile)
      && !(layoutType === LAYOUT_TYPE.VIDEO_FOCUS && numCameras > 0 && !fullscreenContext);

    const containerWidth = isLargePresentation
      ? svgWidth
      : presentationToolbarMinWidth;

    const slideContent = currentSlide?.content ? `${intl.formatMessage(intlMessages.slideContentStart)}
    ${currentSlide.content}
    ${intl.formatMessage(intlMessages.slideContentEnd)}` : intl.formatMessage(intlMessages.noSlideContent);

    if (!currentPresentation && this.refPresentationContainer) {
      return (
        <></>
        // <PresentationPlaceholder
        //   {
        //   ...presentationBounds
        //   }
        //   setPresentationRef={this.setPresentationRef}
        // />
      );
    }

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
            background: layoutType === LAYOUT_TYPE.VIDEO_FOCUS && numCameras > 0 && !fullscreenContext
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
              >
                <Styled.VisuallyHidden id="currentSlideText">{slideContent}</Styled.VisuallyHidden>
                {!tldrawIsMounting && currentSlide && this.renderPresentationMenu()}
                <WhiteboardContainer
                  whiteboardId={currentSlide?.id}
                  podId={podId}
                  slidePosition={slidePosition}
                  getSvgRef={this.getSvgRef}
                  setTldrawAPI={this.setTldrawAPI}
                  curPageId={currentSlide?.num.toString() || '0'}
                  svgUri={currentSlide?.svgUri}
                  intl={intl}
                  presentationWidth={svgWidth}
                  presentationHeight={svgHeight}
                  presentationAreaHeight={presentationBounds?.height}
                  presentationAreaWidth={presentationBounds?.width}
                  isViewersCursorLocked={isViewersCursorLocked}
                  isPanning={this.state.isPanning}
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
              {/*this.renderPresentationToolbar()*/}
            </Styled.SvgContainer>
          </Styled.Presentation>
          {/*
        <Styled.Presentation ref={(ref) => { this.refPresentation = ref; }}>
          <Styled.WhiteboardSizeAvailable ref={(ref) => { this.refWhiteboardArea = ref; }} />
          <Styled.SvgContainer
            style={{
              height: svgHeight + toolbarHeight,
            }}
          >
            {showSlide && svgWidth > 0 && svgHeight > 0
              ? this.renderPresentation(svgDimensions, viewBoxDimensions)
              : null}
            {showSlide && (userIsPresenter || multiUser)
              ? this.renderWhiteboardToolbar(svgDimensions)
              : null}
            {showSlide && userIsPresenter
              ? (
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
              )
              : null}
          </Styled.SvgContainer>
        </Styled.Presentation> */}
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
};

Presentation.defaultProps = {
  currentSlide: undefined,
  slidePosition: undefined,
};
