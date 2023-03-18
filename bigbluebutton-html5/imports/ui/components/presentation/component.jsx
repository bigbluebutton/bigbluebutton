import React, { PureComponent, Fragment } from 'react';
import { createPortal } from 'react-dom';
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

function copyStyles(sourceDoc, targetDoc, tlStyles) {
  //Most of this code was copied from https://medium.com/hackernoon/using-a-react-16-portal-to-do-something-cool-2a2d627b0202
  const hostUri = `https://${window.document.location.hostname}`;
  const baseName = hostUri + Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename + Meteor.settings.public.app.instanceId;
  // In the darkmode, sourceDoc.styleSheets gives severe error.. (spreadArray not defined) need to be solved!
  Array.from(sourceDoc.styleSheets).concat(tlStyles).forEach(styleSheet => {
    if (styleSheet.cssRules) {
      const newStyleEl = sourceDoc.createElement('style');
      Array.from(styleSheet.cssRules).forEach(cssRule => {
        let newCssText;
        if (cssRule.cssText.match(/url\(\"[fonts|files]/)) {
          newCssText = cssRule.cssText.replace(/url\(\"([^\"]*)/g, function(){return 'url("' + baseName + '/' + arguments[1]});
        } else {
          newCssText = cssRule.cssText;
        }
        newStyleEl.appendChild(sourceDoc.createTextNode(newCssText));
      });

      targetDoc.head.appendChild(newStyleEl);
    } else if (styleSheet.href) {
      const newLinkEl = sourceDoc.createElement('link');
      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}

let presentationWindow = window;
class WindowPortal extends React.PureComponent {
  // Most of the idea and code were copied from https://stackoverflow.com/questions/47909601/onclick-not-working-inside-the-pop-up-opened-via-react-portals
  constructor(props) {
    super(props);
    this.state = { win: null, el: null };
  }

  componentDidMount() {
    const {
      svgSize,
      setEventExternalWindow,
      setPresentationDetached,
      toolbarHeight,
      tlStyles,
    } = this.props;

    let win = window.open('', '', `innerWidth=${svgSize.width},innerHeight=${svgSize.height+toolbarHeight}`);
    win.document.title = 'BigBlueButton Portal Window';
    // No effect anymore?
    win.document.body.style.position = 'relative'; // to center the slide
    copyStyles(document, win.document, tlStyles);
    let el = document.createElement('div');
    win.document.body.appendChild(el);
    presentationWindow = win;
    setEventExternalWindow(win, toolbarHeight);

    win.addEventListener('beforeunload', () => {
      presentationWindow = window;
      setPresentationDetached(false); //for closing the window by X button
    });

    this.setState({ win, el });
  }

  componentWillUnmount() {
    const { win } = this.state;
    //in darkMode win gets null... to be fixed!
    win.close();
  }

  render() {
    const { el } = this.state;
    if (!el) {
      return null;
    }
    return createPortal(this.props.children, el);
  }
}

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
    this.setEventExternalWindow = this.setEventExternalWindow.bind(this);

    this.onResize = () => setTimeout(this.handleResize.bind(this), 0);
    this.renderCurrentPresentationToast = this.renderCurrentPresentationToast.bind(this);
    this.setPresentationRef = this.setPresentationRef.bind(this);
    this.setTldrawIsMounting = this.setTldrawIsMounting.bind(this);
    Session.set('componentPresentationWillUnmount', false);
    this.tlStyles = [];
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
    const { isPresentationDetached } = this.props;
    this.getInitialPresentationSizes();
    this.refPresentationContainer.addEventListener('keydown', this.handlePanShortcut);
    this.refPresentationContainer.addEventListener('keyup', this.handlePanShortcut);
    this.refPresentationContainer
      .addEventListener(FULLSCREEN_CHANGE_EVENT, this.onFullscreenChange);
    if (isPresentationDetached){
      presentationWindow.addEventListener('resize', this.onResize, false);
    } else {
      window.addEventListener('resize', this.onResize, false);
    }


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
      setPresentationIsOpen,
      restoreOnUpdate,
      layoutContextDispatch,
      userIsPresenter,
      presentationBounds,
      numCameras,
      intl,
      multiUser,
    } = this.props;

    const {
      presentationWidth, presentationHeight, zoom, isPanning, fitToWidth,
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

      if (!presentationIsOpen && restoreOnUpdate && currentSlide) {
        const slideChanged = currentSlide.id !== prevProps.currentSlide.id;
        const positionChanged = slidePosition
          .viewBoxHeight !== prevProps.slidePosition.viewBoxHeight
          || slidePosition.viewBoxWidth !== prevProps.slidePosition.viewBoxWidth;
        const pollPublished = publishedPoll && !prevProps.publishedPoll;
        if (slideChanged || positionChanged || pollPublished) {
          setPresentationIsOpen(layoutContextDispatch, !presentationIsOpen);
        }
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

    presentationWindow.removeEventListener('resize', this.onResize, false);
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
    const { isPresentationDetached } = this.props;
    const presentationSizes = this.getPresentationSizesAvailable();
    if (Object.keys(presentationSizes).length > 0) {
      // updating the size of the space available for the slide
      //This condition enables the resizing of detached window, by removing this condition, the original window start to resize after merging the detached window.
      if (!Session.get('componentPresentationWillUnmount') || !isPresentationDetached) {
        this.setState({
          presentationHeight: presentationSizes.presentationHeight,
          presentationWidth: presentationSizes.presentationWidth,
        });
      }
    }
  }

  setEventExternalWindow (win, toolbarHeight) {
    win.addEventListener('resize', () => {
      this.setState({
        presentationWidth: win.innerWidth,
        presentationHeight: win.innerHeight - toolbarHeight,
      });
    });

    win.addEventListener(FULLSCREEN_CHANGE_EVENT, () => {
      const { isFullscreen } = this.state;
      const newIsFullscreen = FullscreenService.isFullScreen(presentationWindow.document.documentElement, presentationWindow.document);
      if (isFullscreen !== newIsFullscreen) {
        this.setState({ isFullscreen: newIsFullscreen });
         //when exiting fullscreen by ESC key, which does not fire a key event, we need to set the layoutContext here,
         // so that the 'exit fullscreen' icon is shown correctly in the detached window.
         // This does not actually affect the functionality of the button itself.
        if (isFullscreen) {
          this.props.layoutContextDispatch({
            type: ACTIONS.SET_FULLSCREEN_ELEMENT,
            value: {
              element: '',
              group: '',
            },
          });
        }
      }
      this.setState({
        presentationWidth: win.innerWidth,
        presentationHeight: win.innerHeight - toolbarHeight,
      });
    });

    win.addEventListener('keydown', (e) => {
      const api = this.state.tldrawAPI;
      switch (e.key) {
        case 'Delete': case 'Backspace':
          api.delete();
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            api.duplicate();
          }
          break;
        case 'x':
          if (e.ctrlKey || e.metaKey) {
            api.cut();
          }
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            api.copy();
          }
          break;
        case 'v':
          if (e.ctrlKey || e.metaKey) {
            api.paste();
          }
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            api.selectAll();
          }
          break;
        case 'z':
          if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            api.redo();
          } else if (e.ctrlKey || e.metaKey) {
            api.undo();
          }
          break;
        case 'l':
          if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            api.toggleLocked();
          }
          break;
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            const selectedIds = api.getShapes().map(s => s.id).filter(id => api.isSelected(id));
            if (selectedIds.length === 1 && api.getShape(selectedIds[0]).type === 'group') {
              api.ungroup();
            } else {
              api.group();
            }
          }
          break;
        case 'H':
          if (e.shiftKey) {
            api.flipHorizontal();
          }
          break;
        case 'V':
          if (e.shiftKey) {
            api.flipVertical();
          }
          break;
      }
    });
    
    win.addEventListener('mousedown', (e) => {
      if (e.srcElement.id == "canvas"){
        if (e.button == 0){
          this.state.tldrawAPI.setMenuOpen(false);
          const popups = win.document.querySelectorAll('[data-radix-popper-content-wrapper=""]')
          popups.forEach(p => {
            p.style.display = "none";
          });
        } else if (e.button == 2){
          const contextMenu = win.document.getElementById('TD-ContextMenu')
          if (contextMenu) {
            const pContextMenu = contextMenu.parentNode;
            pContextMenu.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0px)`;
            pContextMenu.style.display = "unset";
          }
        }
      }
    });
    
    const handleWheelEvent = (e) => {
      if (e.srcElement.id == "canvas"){
        if (!e.ctrlKey) {
          e.stopPropagation();
          //e.preventDefault(); //to be consistent with 'passive: true' setting
          const newEvent = new WheelEvent('wheel', {
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            deltaZ: e.deltaZ,
            ctrlKey: true,
            clientX: e.clientX,
            clientY: e.clientY,
          });
          const canvas = win.document.getElementById('canvas');
          canvas && canvas.dispatchEvent(newEvent);
        }
      }
    }
    win.addEventListener('wheel', handleWheelEvent, { capture: true, passive: true });
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
      isPresentationDetached,
      presentationBounds,
      presentationAreaSize: newPresentationAreaSize,
    } = this.props;
    const presentationSizes = {
      presentationWidth: 0,
      presentationHeight: 0,
    };

    if (isPresentationDetached && presentationWindow.innerWidth != 0) {
      presentationSizes.presentationWidth = presentationWindow.innerWidth;
      presentationSizes.presentationHeight = presentationWindow.innerHeight - (getToolbarHeight() || 0)
    } else {
      if (newPresentationAreaSize) {
        presentationSizes.presentationWidth = newPresentationAreaSize.presentationAreaWidth;
        presentationSizes.presentationHeight = newPresentationAreaSize
          .presentationAreaHeight - (getToolbarHeight() || 0);
        return presentationSizes;
      }
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
      isPresentationDetached,
      togglePresentationDetached,
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
        togglePresentationDetached={togglePresentationDetached}
        isPresentationDetached={isPresentationDetached}
        presentationWindow={presentationWindow}
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
      isPresentationDetached,
      togglePresentationDetached,
    } = this.props;
    const { tldrawAPI } = this.state;

    return (
      <PresentationMenu
        fullscreenRef={this.refPresentationContainer}
        tldrawAPI={tldrawAPI}
        elementName={intl.formatMessage(intlMessages.presentationLabel)}
        elementId={fullscreenElementId}
        layoutContextDispatch={layoutContextDispatch}
        isPresentationDetached={isPresentationDetached}
        presentationWindow={presentationWindow}
        togglePresentationDetached={togglePresentationDetached}
      />
    );
  }

  render() {
    const {
      userIsPresenter,
      currentSlide,
      slidePosition,
      isPresentationDetached,
      setPresentationDetached,
      setPreviousSvgSize,
      getPreviousSvgSize,
      setPreviousToolbarHeight,
      getPreviousToolbarHeight,
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

    const wbContainer =
         (
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
                  tldrawAPI={tldrawAPI}
                  setTldrawAPI={this.setTldrawAPI}
                  curPageId={currentSlide?.num.toString() || '0'}
                  svgUri={currentSlide?.svgUri}
                  intl={intl}
                  presentationWidth={svgWidth}
                  presentationHeight={svgHeight}
                  presentationAreaHeight={isPresentationDetached ? presentationWindow.document.documentElement.clientHeight : presentationBounds?.height}
                  presentationAreaWidth={isPresentationDetached ? presentationWindow.document.documentElement.clientWidth : presentationBounds?.width}
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
                  isPresentationDetached={isPresentationDetached}
                  presentationWindow={presentationWindow}
                />
                {isFullscreen && <PollingContainer />}
              </div>
         );

    const pToolbar =
              !tldrawIsMounting && (
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
              );

    if (svgHeight != 0 && svgWidth != 0) {
      setPreviousSvgSize(svgWidth, svgHeight);
    }
    if (toolbarHeight != 0) {
      setPreviousToolbarHeight(toolbarHeight);
    }

    //const allStyles = document.getElementsByTagName("style");
    //console.log("ALLSTYLE", allStyles);
    const tldStyles = [/*'tldraw-fonts',*/ 'tl-canvas', 'tl-theme']; // tldraw-fonts is not in the style anymore, see the change at copyStyles
    if (this.tlStyles.filter(v => v).length < tldStyles.length) {
      this.tlStyles = tldStyles.map(id => document.getElementById(id) ? document.getElementById(id).sheet : null);
    }
    //console.log("ALLSTYLE", this.tlStyles);

    return (
      <>
        <Styled.PresentationContainer
          role="region"
          data-test="presentationContainer"
          ref={(ref) => { this.refPresentationContainer = ref; }}
          style={{
            top: isPresentationDetached ? 0 : presentationBounds.top,//these changes do not probably affect anything..
            left: isPresentationDetached ? 0 : presentationBounds.left,
            right: isPresentationDetached ? 0 : presentationBounds.right,
            width: isPresentationDetached ? presentationWindow.document.documentElement.clientWidth : presentationBounds.width,
            height: isPresentationDetached ? presentationWindow.document.documentElement.clientHeight : presentationBounds.height,
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

          {userIsPresenter && isPresentationDetached
            ?
              <Fragment>
                <WindowPortal
                  setPresentationDetached={setPresentationDetached}
                  setEventExternalWindow={this.setEventExternalWindow}
                  svgSize={getPreviousSvgSize()}
                  toolbarHeight={getPreviousToolbarHeight()}
                   tlStyles={this.tlStyles.filter(v => v)}
                >
                  {wbContainer}
                  {pToolbar}
                </WindowPortal>
                {/*
                  wToolbar can be here if it impairs the slide visibility
                */}
              </Fragment>
            :
              <Fragment>
                {wbContainer}
                {pToolbar}
              </Fragment>
          }
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
