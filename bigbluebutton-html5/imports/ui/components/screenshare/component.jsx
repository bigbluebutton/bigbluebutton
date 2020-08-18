import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FullscreenService from '../fullscreen-button/service';
import FullscreenButtonContainer from '../fullscreen-button/container';
import { styles } from './styles';
import AutoplayOverlay from '../media/autoplay-overlay/component';
import logger from '/imports/startup/client/logger';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';

const intlMessages = defineMessages({
  screenShareLabel: {
    id: 'app.screenshare.screenShareLabel',
    description: 'screen share area element label',
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
    };

    this.onVideoLoad = this.onVideoLoad.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.handleAllowAutoplay = this.handleAllowAutoplay.bind(this);
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.failedMediaElements = [];
  }

  componentDidMount() {
    const { presenterScreenshareHasStarted } = this.props;
    presenterScreenshareHasStarted();

    this.screenshareContainer.addEventListener('fullscreenchange', this.onFullscreenChange);
    window.addEventListener('screensharePlayFailed', this.handlePlayElementFailed);
  }

  componentWillReceiveProps(nextProps) {
    const {
      isPresenter, unshareScreen,
    } = this.props;
    if (isPresenter && !nextProps.isPresenter) {
      unshareScreen();
    }
  }

  componentWillUnmount() {
    const {
      presenterScreenshareHasEnded,
      unshareScreen,
      getSwapLayout,
      shouldEnableSwapLayout,
      toggleSwapLayout,
    } = this.props;
    const layoutSwapped = getSwapLayout() && shouldEnableSwapLayout();
    if (layoutSwapped) toggleSwapLayout();
    presenterScreenshareHasEnded();
    unshareScreen();
    this.screenshareContainer.removeEventListener('fullscreenchange', this.onFullscreenChange);
    window.removeEventListener('screensharePlayFailed', this.handlePlayElementFailed);
  }

  onVideoLoad() {
    this.setState({ loaded: true });
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(this.screenshareContainer);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
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
    const { intl } = this.props;
    const { isFullscreen } = this.state;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <FullscreenButtonContainer
        key={_.uniqueId('fullscreenButton-')}
        elementName={intl.formatMessage(intlMessages.screenShareLabel)}
        fullscreenRef={this.screenshareContainer}
        isFullscreen={isFullscreen}
        dark
      />
    );
  }

  render() {
    const { loaded, autoplayBlocked } = this.state;
    const { intl } = this.props;

    return (
      [!loaded
        ? (
          <div
            key={_.uniqueId('screenshareArea-')}
            className={styles.connecting}
          />
        )
        : null,
      !autoplayBlocked
        ? null
        : (
          <AutoplayOverlay
            key={_.uniqueId('screenshareAutoplayOverlay')}
            autoplayBlockedDesc={intl.formatMessage(intlMessages.autoplayBlockedDesc)}
            autoplayAllowLabel={intl.formatMessage(intlMessages.autoplayAllowLabel)}
            handleAllowAutoplay={this.handleAllowAutoplay}
          />
        ),
      (
        <div
          className={styles.screenshareContainer}
          key="screenshareContainer"
          ref={(ref) => { this.screenshareContainer = ref; }}
        >
          {loaded && this.renderFullscreenButton()}
          <video
            id="screenshareVideo"
            key="screenshareVideo"
            style={{ maxHeight: '100%', width: '100%', height: '100%' }}
            playsInline
            onLoadedData={this.onVideoLoad}
            ref={(ref) => { this.videoTag = ref; }}
            muted
          />
        </div>
      )]
    );
  }
}

export default injectIntl(ScreenshareComponent);

ScreenshareComponent.propTypes = {
  intl: intlShape.isRequired,
  isPresenter: PropTypes.bool.isRequired,
  unshareScreen: PropTypes.func.isRequired,
  presenterScreenshareHasEnded: PropTypes.func.isRequired,
  presenterScreenshareHasStarted: PropTypes.func.isRequired,
};
