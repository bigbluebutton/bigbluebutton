import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/common/button/component';
import {
  HUNDRED_PERCENT,
  MAX_PERCENT,
  MIN_PERCENT,
  STEP,
} from '/imports/utils/slideCalcUtils';
import {
  PresentationToolbarItemType,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/presentation-toolbar-item/enums';
import Styled from './styles';
import ZoomTool from './zoom-tool/component';
import SmartMediaShareContainer from './smart-video-share/container';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import KEY_CODES from '/imports/utils/keyCodes';
import Spinner from '/imports/ui/components/common/spinner/component';
import Separator from '/imports/ui/components/common/separator/component';

const intlMessages = defineMessages({
  previousSlideLabel: {
    id: 'app.presentation.presentationToolbar.prevSlideLabel',
    description: 'Previous slide button label',
  },
  previousSlideDesc: {
    id: 'app.presentation.presentationToolbar.prevSlideDesc',
    description: 'Aria description for when switching to previous slide',
  },
  nextSlideLabel: {
    id: 'app.presentation.presentationToolbar.nextSlideLabel',
    description: 'Next slide button label',
  },
  nextSlideDesc: {
    id: 'app.presentation.presentationToolbar.nextSlideDesc',
    description: 'Aria description for when switching to next slide',
  },
  noNextSlideDesc: {
    id: 'app.presentation.presentationToolbar.noNextSlideDesc',
    description: '',
  },
  noPrevSlideDesc: {
    id: 'app.presentation.presentationToolbar.noPrevSlideDesc',
    description: '',
  },
  skipSlideLabel: {
    id: 'app.presentation.presentationToolbar.skipSlideLabel',
    description: 'Aria label for when switching to a specific slide',
  },
  skipSlideDesc: {
    id: 'app.presentation.presentationToolbar.skipSlideDesc',
    description: 'Aria description for when switching to a specific slide',
  },
  goToSlide: {
    id: 'app.presentation.presentationToolbar.goToSlide',
    description: 'button for slide select',
  },
  selectLabel: {
    id: 'app.presentation.presentationToolbar.selectLabel',
    description: 'slide select label',
  },
  fitToWidth: {
    id: 'app.presentation.presentationToolbar.fitToWidth',
    description: 'button for fit to width',
  },
  fitToWidthDesc: {
    id: 'app.presentation.presentationToolbar.fitWidthDesc',
    description: 'Aria description to display the whole width of the slide',
  },
  fitToPage: {
    id: 'app.presentation.presentationToolbar.fitToPage',
    description: 'button label for fit to width',
  },
  fitToPageDesc: {
    id: 'app.presentation.presentationToolbar.fitScreenDesc',
    description: 'Aria description to display the whole slide',
  },
  presentationLabel: {
    id: 'app.presentationUploder.title',
    description: 'presentation area element label',
  },
  toolbarMultiUserOn: {
    id: 'app.whiteboard.toolbar.multiUserOn',
    description: 'Whiteboard toolbar turn multi-user on menu',
  },
  toolbarMultiUserOff: {
    id: 'app.whiteboard.toolbar.multiUserOff',
    description: 'Whiteboard toolbar turn multi-user off menu',
  },
  multiUserLimitHasBeenReached: {
    id: 'app.whiteboard.toolbar.multiUserLimitHasBeenReached',
    description: 'Whiteboard toolbar toggle multi-user disabled',
  },
  infiniteWhiteboardOn: {
    id: 'app.whiteboard.toolbar.infiniteWhiteboardOn',
    description: 'Whiteboard toolbar turn infinite wb on',
  },
  infiniteWhiteboardOff: {
    id: 'app.whiteboard.toolbar.infiniteWhiteboardOff',
    description: 'Whiteboard toolbar turn infinite wb off',
  },
  pan: {
    id: 'app.whiteboard.toolbar.tools.hand',
    description: 'presentation toolbar pan label',
  },
});

class PresentationToolbar extends PureComponent {
  constructor(props) {
    super(props);

    this.handleSkipToSlideChange = this.handleSkipToSlideChange.bind(this);
    this.change = this.change.bind(this);
    this.renderAriaDescs = this.renderAriaDescs.bind(this);
    this.nextSlideHandler = this.nextSlideHandler.bind(this);
    this.previousSlideHandler = this.previousSlideHandler.bind(this);
    this.fullscreenToggleHandler = this.fullscreenToggleHandler.bind(this);
    this.switchSlide = this.switchSlide.bind(this);
    this.handleSwitchWhiteboardMode = this.handleSwitchWhiteboardMode.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.switchSlide);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.switchSlide);
  }

  handleSkipToSlideChange(event) {
    const { skipToSlide, currentSlide, setPresentationPageInfiniteWhiteboard } = this.props;
    const requestedSlideNum = Number.parseInt(event.target.value, 10);

    const isInfiniteWhiteboard = currentSlide?.infiniteWhiteboard;

    if (isInfiniteWhiteboard) setPresentationPageInfiniteWhiteboard(false);

    if (event) event.currentTarget.blur();
    skipToSlide(requestedSlideNum);
  }

  handleSwitchWhiteboardMode() {
    const {
      multiUser,
      whiteboardId,
      removeWhiteboardGlobalAccess,
      addWhiteboardGlobalAccess,
    } = this.props;
    if (multiUser) {
      return removeWhiteboardGlobalAccess(whiteboardId);
    }
    return addWhiteboardGlobalAccess(whiteboardId);
  }

  fullscreenToggleHandler() {
    const {
      fullscreenElementId,
      isFullscreen,
      layoutContextDispatch,
      fullscreenAction,
      fullscreenRef,
      handleToggleFullScreen,
    } = this.props;

    handleToggleFullScreen(fullscreenRef);
    const newElement = isFullscreen ? '' : fullscreenElementId;

    layoutContextDispatch({
      type: fullscreenAction,
      value: {
        element: newElement,
        group: '',
      },
    });
  }

  nextSlideHandler(event) {
    const {
      nextSlide, currentSlide, setPresentationPageInfiniteWhiteboard,
    } = this.props;
    const isInfiniteWhiteboard = currentSlide?.infiniteWhiteboard;

    if (isInfiniteWhiteboard) setPresentationPageInfiniteWhiteboard(false);

    if (event) event.currentTarget.blur();
    nextSlide();
  }

  previousSlideHandler(event) {
    const {
      previousSlide, currentSlide, setPresentationPageInfiniteWhiteboard,
    } = this.props;

    const isInfiniteWhiteboard = currentSlide?.infiniteWhiteboard;

    if (isInfiniteWhiteboard) setPresentationPageInfiniteWhiteboard(false);

    if (event) event.currentTarget.blur();
    previousSlide();
  }

  switchSlide(event) {
    const { target, which } = event;
    const isBody = target.nodeName === 'BODY';

    if (isBody) {
      switch (which) {
        case KEY_CODES.ARROW_LEFT:
        case KEY_CODES.PAGE_UP:
          this.previousSlideHandler();
          break;
        case KEY_CODES.ARROW_RIGHT:
        case KEY_CODES.PAGE_DOWN:
          this.nextSlideHandler();
          break;
        case KEY_CODES.ENTER:
          this.fullscreenToggleHandler();
          break;
        default:
      }
    }
  }

  change(value) {
    const { zoomChanger } = this.props;
    zoomChanger(value);
  }

  renderToolbarPluginItems() {
    let pluginProvidedItems = [];
    if (this.props) {
      const {
        pluginProvidedPresentationToolbarItems,
      } = this.props;
      pluginProvidedItems = pluginProvidedPresentationToolbarItems;
    }

    return pluginProvidedItems?.map((ppb) => {
      let componentToReturn;
      const ppbId = ppb.id;

      switch (ppb.type) {
        case PresentationToolbarItemType.BUTTON:
          componentToReturn = (
            <Button
              key={ppbId}
              style={{ marginLeft: '2px', ...ppb.style }}
              label={ppb.label}
              onClick={ppb.onClick}
              tooltipLabel={ppb.tooltip}
            />
          );
          break;
        case PresentationToolbarItemType.SPINNER:
          componentToReturn = (
            <Spinner
              key={ppbId}
            />
          );
          break;
        case PresentationToolbarItemType.SEPARATOR:
          componentToReturn = (
            <Separator />
          );
          break;
        default:
          componentToReturn = null;
      }
      return componentToReturn;
    });
  }

  renderAriaDescs() {
    const { intl } = this.props;
    return (
      <div hidden>
        {/* Aria description's for toolbar buttons */}
        <div id="prevSlideDesc">
          {intl.formatMessage(intlMessages.previousSlideDesc)}
        </div>
        <div id="noPrevSlideDesc">
          {intl.formatMessage(intlMessages.noPrevSlideDesc)}
        </div>
        <div id="nextSlideDesc">
          {intl.formatMessage(intlMessages.nextSlideDesc)}
        </div>
        <div id="noNextSlideDesc">
          {intl.formatMessage(intlMessages.noNextSlideDesc)}
        </div>
        <div id="skipSlideDesc">
          {intl.formatMessage(intlMessages.skipSlideDesc)}
        </div>
        <div id="fitWidthDesc">
          {intl.formatMessage(intlMessages.fitToWidthDesc)}
        </div>
        <div id="fitPageDesc">
          {intl.formatMessage(intlMessages.fitToPageDesc)}
        </div>
      </div>
    );
  }

  renderSkipSlideOpts(numberOfSlides) {
    // Fill drop down menu with all the slides in presentation
    const { intl } = this.props;
    const optionList = [];
    for (let i = 1; i <= numberOfSlides; i += 1) {
      optionList.push(
        <option value={i} key={i}>
          {intl.formatMessage(intlMessages.goToSlide, { slideNumber: i })}
        </option>,
      );
    }

    return optionList;
  }

  render() {
    const {
      currentSlideNum,
      numberOfSlides,
      fitToWidthHandler,
      fitToWidth,
      intl,
      zoom,
      isMeteorConnected,
      isPollingEnabled,
      amIPresenter,
      startPoll,
      currentSlide,
      slidePosition,
      meetingIsBreakout,
      multiUserSize,
      multiUser,
      setPresentationPageInfiniteWhiteboard,
      allowInfiniteWhiteboard,
      allowInfiniteWhiteboardInBreakouts,
      infiniteWhiteboardIcon,
      resetSlide,
      zoomChanger,
      tldrawAPI,
      maxNumberOfActiveUsers,
      numberOfJoinedUsers,
    } = this.props;

    const { isMobile } = deviceInfo;

    const startOfSlides = !(currentSlideNum > 1);
    const endOfSlides = !(currentSlideNum < numberOfSlides);

    const prevSlideAriaLabel = startOfSlides
      ? intl.formatMessage(intlMessages.previousSlideLabel)
      : `${intl.formatMessage(intlMessages.previousSlideLabel)} (${currentSlideNum <= 1 ? '' : currentSlideNum - 1
      })`;

    const nextSlideAriaLabel = endOfSlides
      ? intl.formatMessage(intlMessages.nextSlideLabel)
      : `${intl.formatMessage(intlMessages.nextSlideLabel)} (${currentSlideNum >= 1 ? currentSlideNum + 1 : ''
      })`;

    const isInfiniteWhiteboard = currentSlide?.infiniteWhiteboard;

    const showIWB = (allowInfiniteWhiteboard && !meetingIsBreakout)
      || (meetingIsBreakout && allowInfiniteWhiteboardInBreakouts);

    const multiUserLimitExceeded = numberOfJoinedUsers > maxNumberOfActiveUsers;
    const disableStartingMultiUser = !multiUser && multiUserLimitExceeded;
    let multiUserLabel;
    if (disableStartingMultiUser) {
      multiUserLabel = intl.formatMessage(
        intlMessages.multiUserLimitHasBeenReached,
        { numberOfUsers: maxNumberOfActiveUsers },
      );
    } else if (multiUser) {
      multiUserLabel = intl.formatMessage(intlMessages.toolbarMultiUserOff);
    } else {
      multiUserLabel = intl.formatMessage(intlMessages.toolbarMultiUserOn);
    }

    return (
      <Styled.PresentationToolbarWrapper
        id="presentationToolbarWrapper"
      >
        {this.renderAriaDescs()}
        <Styled.QuickPollButtonWrapper>
          {this.renderToolbarPluginItems()}
          {isPollingEnabled ? (
            <Styled.QuickPollButton
              {...{
                intl,
                amIPresenter,
                startPoll,
                currentSlide,
              }}
            />
          ) : null}

          <SmartMediaShareContainer {...{ intl, currentSlide }} />
        </Styled.QuickPollButtonWrapper>
        <Styled.PresentationSlideControls>
          <Styled.PrevSlideButton
            role="button"
            aria-label={prevSlideAriaLabel}
            aria-describedby={
              startOfSlides ? 'noPrevSlideDesc' : 'prevSlideDesc'
            }
            disabled={startOfSlides || !isMeteorConnected}
            color="light"
            circle
            icon="left_arrow"
            size="md"
            onClick={this.previousSlideHandler}
            label={intl.formatMessage(intlMessages.previousSlideLabel)}
            hideLabel
            data-test="prevSlide"
          />

          <TooltipContainer
            title={intl.formatMessage(intlMessages.selectLabel)}
          >
            <Styled.SkipSlideSelect
              id="skipSlide"
              aria-label={intl.formatMessage(intlMessages.skipSlideLabel)}
              aria-describedby="skipSlideDesc"
              aria-live="polite"
              aria-relevant="all"
              disabled={!isMeteorConnected}
              value={currentSlideNum}
              onChange={this.handleSkipToSlideChange}
              data-test="skipSlide"
            >
              {this.renderSkipSlideOpts(numberOfSlides)}
            </Styled.SkipSlideSelect>
          </TooltipContainer>
          <Styled.NextSlideButton
            role="button"
            aria-label={nextSlideAriaLabel}
            aria-describedby={
              endOfSlides ? 'noNextSlideDesc' : 'nextSlideDesc'
            }
            disabled={endOfSlides || !isMeteorConnected}
            color="light"
            circle
            icon="right_arrow"
            size="md"
            onClick={this.nextSlideHandler}
            label={intl.formatMessage(intlMessages.nextSlideLabel)}
            hideLabel
            data-test="nextSlide"
          />
        </Styled.PresentationSlideControls>
        <Styled.PresentationZoomControls>
          {(showIWB) && (
          <Styled.InfiniteWhiteboardButton
            data-test={isInfiniteWhiteboard ? 'turnInfiniteWhiteboardOff' : 'turnInfiniteWhiteboardOn'}
            role="button"
            aria-label={
              isInfiniteWhiteboard
                ? intl.formatMessage(intlMessages.infiniteWhiteboardOff)
                : intl.formatMessage(intlMessages.infiniteWhiteboardOn)
            }
            color="light"
            disabled={!isMeteorConnected}
            customIcon={infiniteWhiteboardIcon(isInfiniteWhiteboard)}
            size="md"
            circle
            onClick={() => {
              if (isInfiniteWhiteboard) {
                tldrawAPI.setCamera({ x: 0, y: 0 });
                resetSlide();
                zoomChanger(100);
              }
              setPresentationPageInfiniteWhiteboard(!isInfiniteWhiteboard);
            }}
            label={
              isInfiniteWhiteboard
                ? intl.formatMessage(intlMessages.infiniteWhiteboardOff)
                : intl.formatMessage(intlMessages.infiniteWhiteboardOn)
            }
            hideLabel
          />
          )}

          <Styled.WBAccessButton
            data-test={multiUser ? 'turnMultiUsersWhiteboardOff' : 'turnMultiUsersWhiteboardOn'}
            role="button"
            aria-label={multiUserLabel}
            color="light"
            disabled={disableStartingMultiUser}
            icon={multiUser ? 'multi_whiteboard' : 'whiteboard'}
            size="md"
            circle
            onClick={() => this.handleSwitchWhiteboardMode(!multiUser)}
            label={multiUserLabel}
            hideLabel
          />
          {multiUser ? (
            <Styled.MultiUserTool
              onClick={() => this.handleSwitchWhiteboardMode(!multiUser)}
            >
              {multiUserSize}
            </Styled.MultiUserTool>
          ) : (
            <Styled.MUTPlaceholder />
          )}
          {!isMobile ? (
            <TooltipContainer>
              <ZoomTool
                slidePosition={slidePosition}
                zoomValue={zoom}
                currentSlideNum={currentSlideNum}
                change={this.change}
                minBound={isInfiniteWhiteboard ? MIN_PERCENT : HUNDRED_PERCENT}
                maxBound={MAX_PERCENT}
                step={STEP}
                isInfiniteWhiteboard={isInfiniteWhiteboard}
                isMeteorConnected={isMeteorConnected}
              />
            </TooltipContainer>
          ) : null}
          <Styled.FitToWidthButton
            role="button"
            data-test="fitToWidthButton"
            aria-describedby={fitToWidth ? 'fitPageDesc' : 'fitWidthDesc'}
            aria-label={
              fitToWidth
                ? `${intl.formatMessage(
                  intlMessages.presentationLabel,
                )} ${intl.formatMessage(intlMessages.fitToPage)}`
                : `${intl.formatMessage(
                  intlMessages.presentationLabel,
                )} ${intl.formatMessage(intlMessages.fitToWidth)}`
            }
            color="light"
            disabled={!isMeteorConnected}
            icon="fit_to_width"
            size="md"
            circle
            onClick={fitToWidthHandler}
            label={fitToWidth
              ? intl.formatMessage(intlMessages.fitToPage)
              : intl.formatMessage(intlMessages.fitToWidth)}
            hideLabel
            $fitToWidth={fitToWidth}
          />
        </Styled.PresentationZoomControls>
      </Styled.PresentationToolbarWrapper>
    );
  }
}

PresentationToolbar.propTypes = {
  // Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,
  // Total number of slides in this presentation
  numberOfSlides: PropTypes.number.isRequired,
  // Actions required for the presenter toolbar
  nextSlide: PropTypes.func.isRequired,
  previousSlide: PropTypes.func.isRequired,
  skipToSlide: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  zoomChanger: PropTypes.func.isRequired,
  fitToWidthHandler: PropTypes.func.isRequired,
  fitToWidth: PropTypes.bool.isRequired,
  zoom: PropTypes.number.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
  fullscreenElementId: PropTypes.string.isRequired,
  fullscreenAction: PropTypes.string.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  setIsPanning: PropTypes.func.isRequired,
  multiUser: PropTypes.bool.isRequired,
  whiteboardId: PropTypes.string.isRequired,
  removeWhiteboardGlobalAccess: PropTypes.func.isRequired,
  addWhiteboardGlobalAccess: PropTypes.func.isRequired,
  fullscreenRef: PropTypes.instanceOf(Element),
  handleToggleFullScreen: PropTypes.func.isRequired,
  isPollingEnabled: PropTypes.bool.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  startPoll: PropTypes.func.isRequired,
  currentSlide: PropTypes.shape().isRequired,
  slidePosition: PropTypes.shape().isRequired,
  multiUserSize: PropTypes.number.isRequired,
  maxNumberOfActiveUsers: PropTypes.number.isRequired,
  numberOfJoinedUsers: PropTypes.number.isRequired,
};

PresentationToolbar.defaultProps = {
  fullscreenRef: null,
};

export default injectWbResizeEvent(injectIntl(PresentationToolbar));
