import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FullscreenService from '../fullscreen-button/service';
import FullscreenButtonContainer from '../fullscreen-button/container';
import SwitchButtonContainer from './switch-button/container';
import { styles } from './styles';
import AutoplayOverlay from '../media/autoplay-overlay/component';
import logger from '/imports/startup/client/logger';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import PollingContainer from '/imports/ui/components/polling/container';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';
import {
  SCREENSHARE_MEDIA_ELEMENT_NAME,
  screenshareHasEnded,
  screenshareHasStarted,
  getMediaElement,
  attachLocalPreviewStream,
} from '/imports/ui/components/screenshare/service';
import {
  isStreamStateUnhealthy,
  subscribeToStreamStateChange,
  unsubscribeFromStreamStateChange,
} from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';

const intlMessages = defineMessages({
  screenShareLabel: {
    id: 'app.screenshare.screenShareLabel',
    description: 'screen share area element label',
  },
  presenterLoadingLabel: {
    id: 'app.screenshare.presenterLoadingLabel',
  },
  viewerLoadingLabel: {
    id: 'app.screenshare.viewerLoadingLabel',
  },
  presenterSharingLabel: {
    id: 'app.screenshare.presenterSharingLabel',
  },
  autoplayBlockedDesc: {
    id: 'app.media.screenshare.autoplayBlockedDesc',
  },
  autoplayAllowLabel: {
    id: 'app.media.screenshare.autoplayAllowLabel',
  },
});

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

class ScreenshareComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: false,
      isFullscreen: false,
      autoplayBlocked: false,
      isStreamHealthy: false,
      switched: false,
    };

    this.onLoadedData = this.onLoadedData.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.handleAllowAutoplay = this.handleAllowAutoplay.bind(this);
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.failedMediaElements = [];
    this.onStreamStateChange = this.onStreamStateChange.bind(this);
    this.onSwitched = this.onSwitched.bind(this);
  }

  componentDidMount() {
    screenshareHasStarted();
    this.screenshareContainer.addEventListener('fullscreenchange', this.onFullscreenChange);
    // Autoplay failure handling
    window.addEventListener('screensharePlayFailed', this.handlePlayElementFailed);
    // Stream health state tracker to propagate UI changes on reconnections
    subscribeToStreamStateChange('screenshare', this.onStreamStateChange);
    // Attaches the local stream if it exists to serve as the local presenter preview
    attachLocalPreviewStream(getMediaElement());
  }

  componentDidUpdate(prevProps) {
    const {
      isPresenter,
    } = this.props;
    if (isPresenter && !prevProps.isPresenter) {
      screenshareHasEnded();
    }
  }

  componentWillUnmount() {
    const {
      getSwapLayout,
      shouldEnableSwapLayout,
      toggleSwapLayout,
      newLayoutContextDispatch,
    } = this.props;
    const layoutSwapped = getSwapLayout() && shouldEnableSwapLayout();
    if (layoutSwapped) toggleSwapLayout(newLayoutContextDispatch);
    screenshareHasEnded();
    this.screenshareContainer.removeEventListener('fullscreenchange', this.onFullscreenChange);
    window.removeEventListener('screensharePlayFailed', this.handlePlayElementFailed);
    unsubscribeFromStreamStateChange('screenshare', this.onStreamStateChange);
  }

  onStreamStateChange(event) {
    const { streamState } = event.detail;
    const { isStreamHealthy } = this.state;

    const newHealthState = !isStreamStateUnhealthy(streamState);
    event.stopPropagation();
    if (newHealthState !== isStreamHealthy) {
      this.setState({ isStreamHealthy: newHealthState });
    }
  }

  onLoadedData() {
    this.setState({ loaded: true });
  }

  onSwitched() {
    this.setState(prevState => ({ switched: !prevState.switched }));
  }

  onFullscreenChange() {
    const { layoutContextDispatch } = this.props;
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(this.screenshareContainer);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
      layoutContextDispatch({ type: 'setScreenShareFullscreen', value: newIsFullscreen });
    }
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

  renderFullscreenButton() {
    const { intl, fullscreenElementId } = this.props;
    const { isFullscreen } = this.state;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <FullscreenButtonContainer
        key={_.uniqueId('fullscreenButton-')}
        elementName={intl.formatMessage(intlMessages.screenShareLabel)}
        fullscreenRef={this.screenshareContainer}
        elementId={fullscreenElementId}
        isFullscreen={isFullscreen}
        dark
      />
    );
  }

  renderAutoplayOverlay() {
    const { intl } = this.props;

    return (
      <AutoplayOverlay
        key={_.uniqueId('screenshareAutoplayOverlay')}
        autoplayBlockedDesc={intl.formatMessage(intlMessages.autoplayBlockedDesc)}
        autoplayAllowLabel={intl.formatMessage(intlMessages.autoplayAllowLabel)}
        handleAllowAutoplay={this.handleAllowAutoplay}
      />
    );
  }

  renderSwitchButton() {
    const { switched } = this.state;

    return (
      <SwitchButtonContainer
        handleSwitch={this.onSwitched}
        switched={switched}
        dark
      />
    );
  }

  renderVideo(switched) {
    const { isGloballyBroadcasting } = this.props;

    return (
      <video
        id={SCREENSHARE_MEDIA_ELEMENT_NAME}
        key={SCREENSHARE_MEDIA_ELEMENT_NAME}
        style={switched
          ? { maxHeight: '100%', width: '100%', height: '100%' }
          : { maxHeight: '25%', width: '25%', height: '25%' }}
        className={!isGloballyBroadcasting ? styles.unhealthyStream : null}
        playsInline
        onLoadedData={this.onLoadedData}
        ref={(ref) => {
          this.videoTag = ref;
        }}
        muted
      />
    );
  }

  renderScreenshareContainerInside(mainText) {

    return (
      <div className={styles.screenshareContainerInside}>
        <h1 className={styles.mainText}>{mainText}</h1>
      </div>
    );
  }

  renderScreensharePresenter() {
    const { loaded, switched } = this.state;
    const { isGloballyBroadcasting, intl } = this.props;

    return (
      <div
        className={switched ? styles.screenshareContainer : styles.screenshareContainerPresenter}
        key="screenshareContainer"
        ref={(ref) => { this.screenshareContainer = ref; }}
      >
        {loaded && this.renderSwitchButton()}
        {this.renderVideo(switched)}

        {isGloballyBroadcasting
          ? (
            <div>
              {!switched
                && this.renderScreenshareContainerInside(intl.formatMessage(intlMessages.presenterSharingLabel))}
            </div>
          )
          : this.renderScreenshareContainerInside(intl.formatMessage(intlMessages.presenterLoadingLabel))
        }
      </div>
    );
  }

  renderScreenshareDefault() {
    const { intl } = this.props;
    const {
      isFullscreen,
      loaded,
    } = this.state;

    return (
      <div
        className={styles.screenshareContainer}
        key="screenshareContainer"
        ref={(ref) => {
          this.screenshareContainer = ref;
        }}
      >
        {isFullscreen && <PollingContainer />}
        {loaded && this.renderFullscreenButton()}
        {this.renderVideo(true)}

        <div className={styles.screenshareContainerDefault}>
          {!loaded
            ? this.renderScreenshareContainerInside(
              intl.formatMessage(intlMessages.viewerLoadingLabel),
            )
            : null
          }
        </div>
      </div>
    );
  }

  render() {
    const { loaded, autoplayBlocked, isStreamHealthy } = this.state;
    const {
      isPresenter,
      isGloballyBroadcasting,
      top,
      left,
      width,
      height,
      zIndex,
      layoutLoaded,
    } = this.props;

    // Conditions to render the (re)connecting dots and the unhealthy stream
    // grayscale:
    // 1 - The local media tag has not received any stream data yet
    // 2 - The user is a presenter and the stream wasn't globally broadcasted yet
    // 3 - The media was loaded, the stream was globally broadcasted BUT the stream
    // state transitioned to an unhealthy stream. tl;dr: screen sharing reconnection
    const shouldRenderConnectingState = !loaded
      || (isPresenter && !isGloballyBroadcasting)
      || !isStreamHealthy && loaded && isGloballyBroadcasting;

    return (
      <div
        style={
          layoutLoaded === 'new'
            ? {
              position: 'absolute',
              top,
              left,
              height,
              width,
              zIndex,
              backgroundColor: '#06172A',
            }
            : {
              height: '100%',
              width: '100%',
            }
        }
      >
        {(shouldRenderConnectingState)
          && (
            <div
              key={_.uniqueId('screenshareArea-')}
              className={styles.spinnerWrapper}
              data-test="screenshareConnecting"
            >
              <div className={styles.spinner}>
                <div className={styles.bounce1} />
                <div className={styles.bounce2} />
                <div />
              </div>
            </div>
          )}
        {autoplayBlocked ? this.renderAutoplayOverlay() : null}
        {isPresenter ? this.renderScreensharePresenter() : this.renderScreenshareDefault()}
      </div>
    );
  }
}

export default injectIntl(withLayoutConsumer(ScreenshareComponent));

ScreenshareComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  isPresenter: PropTypes.bool.isRequired,
};
