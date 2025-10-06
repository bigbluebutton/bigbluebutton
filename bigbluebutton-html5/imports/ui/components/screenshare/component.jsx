import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { debounce } from '/imports/utils/debounce';
import { throttle } from '/imports/utils/throttle';
import FullscreenButtonContainer from '/imports/ui/components/common/fullscreen-button/container';
import SwitchButtonContainer from './switch-button/container';
import Styled from './styles';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import VolumeSlider from '../external-video-player/volume-slider/component';
import PluginButtonContainer from '../plugins/plugin-button/container';
import AutoplayOverlay from '../media/autoplay-overlay/component';
import logger from '/imports/startup/client/logger';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import { notify } from '/imports/ui/services/notification';
import {
  SCREENSHARE_MEDIA_ELEMENT_NAME,
  screenshareHasEnded,
  screenshareHasStarted,
  setOutputDeviceId,
  getMediaElement,
  getMediaElementDimensions,
  attachLocalPreviewStream,
  setVolume,
  getVolume,
  setStreamEnabled,
} from '/imports/ui/components/screenshare/service';
import { ACTIONS, PRESENTATION_AREA } from '/imports/ui/components/layout/enums';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import deviceInfo from '/imports/utils/deviceInfo';
import { uniqueId } from '/imports/utils/string-utils';
import Session from '/imports/ui/services/storage/in-memory';

const MOBILE_HOVER_TIMEOUT = 5000;
const MOBILE_HOVER_INTERVAL = 2000;
const SCREEN_SIZE_DISPATCH_INTERVAL = 500;

const renderPluginItems = (pluginItems, bottom, right) => {
  if (pluginItems !== undefined) {
    return (
      <>
        {
          pluginItems.map((pluginItem) => {
            const returnComponent = (
              <PluginButtonContainer
                key={`${pluginItem.type}-${pluginItem.id}-${pluginItem.label}`}
                dark
                bottom={bottom}
                right={right}
                icon={pluginItem.icon}
                label={pluginItem.label}
                onClick={pluginItem.onClick}
              />
            );
            return returnComponent;
          })
        }
      </>
    );
  }
  return (<></>);
};

class ScreenshareComponent extends React.Component {
  static renderScreenshareContainerInside(mainText) {
    return (
      <Styled.ScreenshareContainerInside>
        <Styled.MainText>{mainText}</Styled.MainText>
      </Styled.ScreenshareContainerInside>
    );
  }

  constructor(props) {
    super();
    this.state = {
      loaded: false,
      autoplayBlocked: false,
      switched: false,
      // Volume control hover toolbar
      showHoverToolBar: false,
      screenshareRef: null,
      videoTagRef: null,
    };

    this.onLoadedData = this.onLoadedData.bind(this);
    this.onLoadedMetadata = this.onLoadedMetadata.bind(this);
    this.onVideoResize = this.onVideoResize.bind(this);
    this.handleAllowAutoplay = this.handleAllowAutoplay.bind(this);
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.failedMediaElements = [];
    this.onSwitched = this.onSwitched.bind(this);
    this.handleOnVolumeChanged = this.handleOnVolumeChanged.bind(this);
    this.dispatchScreenShareSize = this.dispatchScreenShareSize.bind(this);
    this.handleOnMuted = this.handleOnMuted.bind(this);
    this.dispatchScreenShareSize = this.dispatchScreenShareSize.bind(this);
    this.renderScreenshareButtons = this.renderScreenshareButtons.bind(this);
    this.splitPluginItems = this.splitPluginItems.bind(this);
    this.handleMouseMovement = throttle(this.handleMouseMovement.bind(this), MOBILE_HOVER_INTERVAL);
    this.debouncedDispatchScreenShareSize = debounce(
      this.dispatchScreenShareSize,
      SCREEN_SIZE_DISPATCH_INTERVAL,
      { leading: false, trailing: true },
    );

    const { locales, icon } = props;
    this.locales = locales;
    this.icon = icon;

    this.volume = getVolume();
    this.mobileHoverSetTimeout = null;
  }

  componentDidMount() {
    const {
      layoutContextDispatch,
      intl,
      isPresenter,
      startPreviewSizeBig,
      outputDeviceId,
      unpinSharedNotes,
      isSharedNotesPinned,
      hasAudio,
      streamId,
    } = this.props;

    screenshareHasStarted(streamId, hasAudio, isPresenter, { outputDeviceId });
    // Autoplay failure handling
    window.addEventListener('screensharePlayFailed', this.handlePlayElementFailed);
    // Attaches the local stream if it exists to serve as the local presenter preview
    attachLocalPreviewStream(getMediaElement());

    this.setState({ switched: startPreviewSizeBig });

    notify(intl.formatMessage(this.locales.started), 'info', this.icon);

    layoutContextDispatch({
      type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
      value: {
        content: PRESENTATION_AREA.SCREEN_SHARE,
        open: true,
      },
    });

    Session.setItem('pinnedNotesLastState', isSharedNotesPinned);
    if (isPresenter) {
      unpinSharedNotes();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isPresenter, outputDeviceId, shouldShowScreenshare } = this.props;
    const { videoTagRef } = this.state;
    if (prevProps.isPresenter && !isPresenter) {
      screenshareHasEnded();
    }

    if (prevProps.outputDeviceId !== outputDeviceId && !isPresenter) {
      setOutputDeviceId(outputDeviceId);
    }

    if (isPresenter) setStreamEnabled(shouldShowScreenshare);

    if (prevProps.shouldShowScreenshare && !shouldShowScreenshare) {
      setVolume(0);
    } else if (!prevProps.shouldShowScreenshare && shouldShowScreenshare) {
      this.volume = this.volume || 1;
      // if this.volume is 0, means user didn't change the volume, so we set it to 1
      setVolume(this.volume);
    }

    if ((prevState.videoTagRef !== videoTagRef) && videoTagRef) {
      videoTagRef.addEventListener('mousemove', this.handleMouseMovement);
    }
  }

  componentWillUnmount() {
    const {
      intl,
      fullscreenContext,
      layoutContextDispatch,
    } = this.props;
    const {
      videoTagRef,
    } = this.state;
    screenshareHasEnded();
    window.removeEventListener('screensharePlayFailed', this.handlePlayElementFailed);

    const Settings = getSettingsSingletonInstance();
    if (Settings.dataSaving.viewScreenshare) {
      notify(intl.formatMessage(this.locales.ended), 'info', this.icon);
    } else {
      notify(intl.formatMessage(this.locales.endedDueToDataSaving), 'info', this.icon);
    }

    layoutContextDispatch({
      type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
      value: {
        content: PRESENTATION_AREA.SCREEN_SHARE,
        open: false,
      },
    });

    if (fullscreenContext) {
      layoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: '',
          group: '',
        },
      });
    }

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_IS_OPEN,
      value: Session.getItem('presentationLastState'),
    });
    if (videoTagRef) {
      videoTagRef.removeEventListener('mousemove', this.handleMouseMovement);
    }
  }

  handleMouseMovement() {
    clearTimeout(this.mobileHoverSetTimeout);
    this.setState({ showHoverToolBar: true });
    this.mobileHoverSetTimeout = setTimeout(
      () => this.setState({ showHoverToolBar: false }),
      MOBILE_HOVER_TIMEOUT,
    );
  }

  handleAllowAutoplay() {
    const { autoplayBlocked } = this.state;

    logger.info({
      logCode: 'screenshare_autoplay_allowed',
    }, 'Screenshare media autoplay allowed by the user');

    window.removeEventListener('screensharePlayFailed', this.handlePlayElementFailed);
    while (this.failedMediaElements.length) {
      const mediaElement = this.failedMediaElements.shift();
      if (mediaElement) {
        const played = playAndRetry(mediaElement);
        if (!played) {
          logger.error({
            logCode: 'screenshare_autoplay_handling_failed',
          }, 'Screenshare autoplay handling failed to play media');
        } else {
          logger.info({
            logCode: 'screenshare_viewer_media_play_success',
          }, 'Screenshare viewer media played successfully');
        }
      }
    }
    if (autoplayBlocked) { this.setState({ autoplayBlocked: false }); }
  }

  handlePlayElementFailed(e) {
    const { mediaElement } = e.detail;
    const { autoplayBlocked } = this.state;

    e.stopPropagation();
    this.failedMediaElements.push(mediaElement);
    if (!autoplayBlocked) {
      logger.info({
        logCode: 'screenshare_autoplay_prompt',
      }, 'Prompting user for action to play screenshare media');

      this.setState({ autoplayBlocked: true });
    }
  }

  dispatchScreenShareSize() {
    const {
      layoutContextDispatch,
    } = this.props;

    const { width, height } = getMediaElementDimensions();
    const value = {
      width,
      height,
      browserWidth: window.innerWidth,
      browserHeight: window.innerHeight,
    };

    layoutContextDispatch({
      type: ACTIONS.SET_SCREEN_SHARE_SIZE,
      value,
    });
  }

  onLoadedMetadata() {
    const element = getMediaElement();

    // Track HTMLVideo's resize event to propagate stream size changes to the
    // layout engine. See this.onVideoResize;
    if (element && typeof element.onresize !== 'function') {
      element.onresize = this.onVideoResize;
    }

    // Dispatch the initial stream size to the layout engine
    this.dispatchScreenShareSize();
  }

  onLoadedData() {
    this.setState({ loaded: true });
  }

  onSwitched() {
    this.setState((prevState) => ({ switched: !prevState.switched }));
  }

  handleOnVolumeChanged(volume) {
    this.volume = volume;
    setVolume(volume);
  }

  handleOnMuted(muted) {
    if (muted) {
      setVolume(0);
    } else {
      setVolume(this.volume);
    }
  }

  onVideoResize() {
    // Debounced version of the dispatcher to pace things out - we don't want
    // to hog the CPU just for resize recalculations...
    this.debouncedDispatchScreenShareSize();
  }

  renderFullscreenButton() {
    const { intl, fullscreenElementId, fullscreenContext } = this.props;

    const ALLOW_FULLSCREEN = window.meetingClientSettings.public.app.allowFullscreen;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <Styled.FullscreenButtonWrapperForScreenshare>
        <FullscreenButtonContainer
          key={uniqueId('fullscreenButton-')}
          elementName={intl.formatMessage(this.locales.label)}
          fullscreenRef={this.screenshareContainer}
          elementId={fullscreenElementId}
          isFullscreen={fullscreenContext}
          dark
        />
      </Styled.FullscreenButtonWrapperForScreenshare>
    );
  }

  renderAutoplayOverlay() {
    const { intl } = this.props;

    return (
      <AutoplayOverlay
        key={uniqueId('screenshareAutoplayOverlay')}
        autoplayBlockedDesc={intl.formatMessage(this.locales.autoplayBlockedDesc)}
        autoplayAllowLabel={intl.formatMessage(this.locales.autoplayAllowLabel)}
        handleAllowAutoplay={this.handleAllowAutoplay}
      />
    );
  }

  renderSwitchButton() {
    const { showSwitchPreviewSizeButton } = this.props;
    const { switched } = this.state;

    if (!showSwitchPreviewSizeButton) return null;

    return (
      <SwitchButtonContainer
        handleSwitch={this.onSwitched}
        switched={switched}
        dark
      />
    );
  }

  renderMobileVolumeControlOverlay () {
    return (
      <Styled.MobileControlsOverlay
        key="mobile-overlay-screenshare"
        ref={(ref) => { this.overlay = ref; }}
        onTouchStart={() => {
          clearTimeout(this.mobileHoverSetTimeout);
          this.setState({ showHoverToolBar: true });
        }}
        onTouchEnd={() => {
          this.mobileHoverSetTimeout = setTimeout(
            () => this.setState({ showHoverToolBar: false }),
            MOBILE_HOVER_TIMEOUT,
          );
        }}
      />
    );
  }

  renderVolumeSlider() {
    const { showHoverToolBar } = this.state;

    let toolbarStyle = 'hoverToolbar';

    if (!showHoverToolBar) {
      toolbarStyle = 'dontShowMobileHoverToolbar';
    } else {
      toolbarStyle = 'showMobileHoverToolbar';
    }

    return [(
      <Styled.HoverToolbar
        toolbarStyle={toolbarStyle}
        key="hover-toolbar-screenshare"
      >
        <VolumeSlider
          volume={getVolume()}
          muted={getVolume() === 0}
          onVolumeChanged={this.handleOnVolumeChanged}
          onMuted={this.handleOnMuted}
        />
      </Styled.HoverToolbar>
    ),
    (deviceInfo.isMobile) && this.renderMobileVolumeControlOverlay(),
    ];
  }

  renderVideo(switched) {
    const { isGloballyBroadcasting } = this.props;
    const { videoTagRef } = this.state;

    return (
      <Styled.ScreenshareVideo
        id={SCREENSHARE_MEDIA_ELEMENT_NAME}
        key={SCREENSHARE_MEDIA_ELEMENT_NAME}
        unhealthyStream={!isGloballyBroadcasting}
        style={switched
          ? { maxHeight: '100%', width: '100%', height: '100%' }
          : { maxHeight: '25%', width: '25%', height: '25%' }}
        playsInline
        onLoadedData={this.onLoadedData}
        onLoadedMetadata={this.onLoadedMetadata}
        ref={(ref) => {
          this.videoTag = ref;
          if (!videoTagRef && ref) {
            this.setState({
              videoTagRef: ref,
            });
          }
        }}
        muted
      />
    );
  }

  splitPluginItems() {
    const { pluginScreenshareHelperItems } = this.props;

    return pluginScreenshareHelperItems.reduce((result, item) => {
      switch (item.position) {
        case PluginSdk.ScreenshareHelperItemPosition.TOP_RIGHT:
          result.topRightPluginItems.push(item);
          break;
        case PluginSdk.ScreenshareHelperItemPosition.TOP_LEFT:
          result.topLeftPluginItems.push(item);
          break;
        case PluginSdk.ScreenshareHelperItemPosition.BOTTOM_RIGHT:
          result.bottomRightPluginItems.push(item);
          break;
        case PluginSdk.ScreenshareHelperItemPosition.BOTTOM_LEFT:
          result.bottomLeftPluginItems.push(item);
          break;
        default:
          break;
      }
      return result;
    }, {
      topRightPluginItems: [],
      topLeftPluginItems: [],
      bottomRightPluginItems: [],
      bottomLeftPluginItems: [],
    });
  }

  renderScreensharePresenter() {
    const { switched } = this.state;
    const { isGloballyBroadcasting, intl } = this.props;

    return (
      <>
        {this.renderVideo(switched)}

        {
          isGloballyBroadcasting
            ? (
              <div data-test="isSharingScreen">
                {!switched
                  && ScreenshareComponent.renderScreenshareContainerInside(
                    intl.formatMessage(this.locales.presenterSharingLabel),
                  )}
              </div>
            )
            : ScreenshareComponent.renderScreenshareContainerInside(
              intl.formatMessage(this.locales.presenterLoadingLabel),
            )
        }
      </>
    );
  }

  renderScreenshareDefault() {
    const { intl, enableVolumeControl } = this.props;
    const { loaded } = this.state;

    return (
      <>
        {this.renderVideo(true)}
        {loaded && enableVolumeControl && this.renderVolumeSlider() }

        <Styled.ScreenshareContainerDefault>
          {
            !loaded
              ? ScreenshareComponent.renderScreenshareContainerInside(
                intl.formatMessage(this.locales.viewerLoadingLabel),
              )
              : null
          }
        </Styled.ScreenshareContainerDefault>
      </>
    );
  }

  renderScreenshareButtons() {
    const { isPresenter, isGloballyBroadcasting } = this.props;
    const { loaded } = this.state;
    const {
      topRightPluginItems,
      topLeftPluginItems,
      bottomRightPluginItems,
      bottomLeftPluginItems,
    } = this.splitPluginItems();
    return (
      <>
        <Styled.ScreenshareButtonsContainterWrapper
          positionYAxis="top"
          positionXAxis="left"
        >
          {renderPluginItems(topLeftPluginItems, false, false)}
        </Styled.ScreenshareButtonsContainterWrapper>
        <Styled.ScreenshareButtonsContainterWrapper
          positionYAxis="top"
          positionXAxis="right"
        >
          {isPresenter
            // Presenter button:
            ? isGloballyBroadcasting && this.renderSwitchButton()
            // Non-presenter button:
            : loaded && this.renderFullscreenButton()}
          {renderPluginItems(topRightPluginItems, false, true)}
        </Styled.ScreenshareButtonsContainterWrapper>
        <Styled.ScreenshareButtonsContainterWrapper
          positionYAxis="bottom"
          positionXAxis="left"
        >
          {renderPluginItems(bottomLeftPluginItems, true, false)}
        </Styled.ScreenshareButtonsContainterWrapper>
        <Styled.ScreenshareButtonsContainterWrapper
          positionYAxis="bottom"
          positionXAxis="right"
        >
          {renderPluginItems(bottomRightPluginItems, true, true)}
        </Styled.ScreenshareButtonsContainterWrapper>
      </>
    );
  }

  render() {
    const {
      loaded,
      autoplayBlocked,
      switched,
      screenshareRef,
    } = this.state;
    const {
      isPresenter,
      isGloballyBroadcasting,
      top,
      left,
      right,
      width,
      height,
      zIndex,
      fullscreenContext,
      shouldShowScreenshare,
    } = this.props;

    // Conditions to render the connecting animation
    // 1 - The local media tag has not received any stream data yet
    // 2 - The user is a presenter and the stream wasn't globally broadcasted yet
    const shouldRenderConnectingState = !loaded
      || (isPresenter && !isGloballyBroadcasting);

    const display = (width > 0 && height > 0) && shouldShowScreenshare ? 'inherit' : 'none';
    const Settings = getSettingsSingletonInstance();
    const { animations } = Settings.application;

    return (
      <div
        style={
          {
            position: 'absolute',
            display,
            top,
            left,
            right,
            height,
            width,
            zIndex: fullscreenContext ? zIndex : undefined,
            backgroundColor: '#06172A',
          }
        }
      >
        {(shouldRenderConnectingState)
          && (
            <Styled.SpinnerWrapper
              key={uniqueId('screenshareArea-')}
              data-test="screenshareConnecting"
            >
              <Styled.Spinner animations={animations}>
                <Styled.Bounce1 animations={animations} />
                <Styled.Bounce2 animations={animations} />
                <div />
              </Styled.Spinner>
            </Styled.SpinnerWrapper>
          )}
        {autoplayBlocked ? this.renderAutoplayOverlay() : null}
        <Styled.ScreenshareContainer
          switched={isPresenter ? switched : true}
          key="screenshareContainer"
          ref={(ref) => {
            this.screenshareContainer = ref;
            if (!screenshareRef && ref) {
              this.setState({
                screenshareRef: ref,
              });
            }
          }}
          id="screenshareContainer"
        >
          {this.renderScreenshareButtons()}
          {isPresenter
            ? this.renderScreensharePresenter()
            : this.renderScreenshareDefault()}
        </Styled.ScreenshareContainer>
      </div>
    );
  }
}

export default injectIntl(ScreenshareComponent);

ScreenshareComponent.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  pluginScreenshareHelperItems: PropTypes.arrayOf(PropTypes.objectOf({
    position: PropTypes.string,
  })).isRequired,
  isPresenter: PropTypes.bool.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  enableVolumeControl: PropTypes.bool.isRequired,
  outputDeviceId: PropTypes.string,
  streamId: PropTypes.string.isRequired,
};
