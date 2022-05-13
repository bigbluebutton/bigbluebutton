import React, { Component } from 'react';
import PropTypes from 'prop-types';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import {
  sendMessage,
  onMessage,
  removeAllListeners,
  getPlayingState,
} from './service';
import deviceInfo from '/imports/utils/deviceInfo';

import logger from '/imports/startup/client/logger';

import Subtitles from './subtitles/component';
import VolumeSlider from './volume-slider/component';
import ReloadButton from '/imports/ui/components/reload-button/component';
import FullscreenButtonContainer from '/imports/ui/components/common/fullscreen-button/container';

import ArcPlayer from '/imports/ui/components/external-video-player/custom-players/arc-player';
import PeerTubePlayer from '/imports/ui/components/external-video-player/custom-players/peertube';
import { ACTIONS } from '/imports/ui/components/layout/enums';

import Styled from './styles';

const intlMessages = defineMessages({
  autoPlayWarning: {
    id: 'app.externalVideo.autoPlayWarning',
    description: 'Shown when user needs to interact with player to make it work',
  },
  refreshLabel: {
    id: 'app.externalVideo.refreshLabel',
  },
  fullscreenLabel: {
    id: 'app.externalVideo.fullscreenLabel',
  },
  subtitlesOn: {
    id: 'app.externalVideo.subtitlesOn',
  },
  subtitlesOff: {
    id: 'app.externalVideo.subtitlesOff',
  },
});

const SYNC_INTERVAL_SECONDS = 5;
const THROTTLE_INTERVAL_SECONDS = 0.5;
const AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS = 5;
const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

Styled.VideoPlayer.addCustomPlayer(PeerTubePlayer);
Styled.VideoPlayer.addCustomPlayer(ArcPlayer);

class VideoPlayer extends Component {
  static clearVideoListeners() {
    removeAllListeners('play');
    removeAllListeners('stop');
    removeAllListeners('playerUpdate');
    removeAllListeners('presenterReady');
  }

  constructor(props) {
    super(props);

    const { isPresenter } = props;

    this.player = null;
    this.syncInterval = null;
    this.autoPlayTimeout = null;
    this.hasPlayedBefore = false;
    this.playerIsReady = false;

    this.lastMessage = null;
    this.lastMessageTimestamp = Date.now();

    this.throttleTimeout = null;

    this.state = {
      subtitlesOn: false,
      muted: false,
      playing: false,
      autoPlayBlocked: false,
      volume: 1,
      playbackRate: 1,
      key: 0,
      played:0,
      loaded:0,
    };

    this.hideVolume = {
      Vimeo: true,
      Facebook: true,
      ArcPlayer: true,
      //YouTube: true,
    };

    this.opts = {
      // default option for all players, can be overwritten
      playerOptions: {
        autoplay: true,
        playsinline: true,
        controls: isPresenter,
      },
      file: {
        attributes: {
          controls: isPresenter ? 'controls' : '',
          autoplay: 'autoplay',
          playsinline: 'playsinline',
        },
      },
      facebook: {
        controls: isPresenter,
      },
      dailymotion: {
        params: {
          controls: isPresenter,
        },
      },
      youtube: {
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          autohide: 1,
          rel: 0,
          ecver: 2,
          controls: isPresenter ? 1 : 0,
          cc_lang_pref: document.getElementsByTagName('html')[0].lang.substring(0, 2),
        },
      },
      peertube: {
        isPresenter,
      },
      twitch: {
        options: {
          controls: isPresenter,
        },
        playerId: 'externalVideoPlayerTwitch',
      },
      preload: true,
      showHoverToolBar: false,
    };

    this.registerVideoListeners = this.registerVideoListeners.bind(this);
    this.autoPlayBlockDetected = this.autoPlayBlockDetected.bind(this);
    this.handleFirstPlay = this.handleFirstPlay.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.handleOnProgress = this.handleOnProgress.bind(this);
    this.handleOnReady = this.handleOnReady.bind(this);
    this.handleOnPlay = this.handleOnPlay.bind(this);
    this.handleOnPause = this.handleOnPause.bind(this);
    this.handleVolumeChanged = this.handleVolumeChanged.bind(this);
    this.handleOnMuted = this.handleOnMuted.bind(this);
    this.sendSyncMessage = this.sendSyncMessage.bind(this);
    this.getCurrentPlaybackRate = this.getCurrentPlaybackRate.bind(this);
    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.getCurrentVolume = this.getCurrentVolume.bind(this);
    this.getMuted = this.getMuted.bind(this);
    this.setPlaybackRate = this.setPlaybackRate.bind(this);
    this.onBeforeUnload = this.onBeforeUnload.bind(this);
    this.toggleSubtitle = this.toggleSubtitle.bind(this);

    this.mobileHoverSetTimeout = null;
  }

  componentDidMount() {
    const {
      getSwapLayout,
      toggleSwapLayout,
      layoutContextDispatch,
      hidePresentation,
    } = this.props;

    window.addEventListener('beforeunload', this.onBeforeUnload);

    clearInterval(this.syncInterval);
    clearTimeout(this.autoPlayTimeout);

    VideoPlayer.clearVideoListeners();
    this.registerVideoListeners();

    if (getSwapLayout()) toggleSwapLayout(layoutContextDispatch);

    if (hidePresentation) {
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: true,
      });
    }

    layoutContextDispatch({
      type: ACTIONS.SET_HAS_EXTERNAL_VIDEO,
      value: true,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { isPresenter } = this.props;
    const { playing } = this.state;

    // If user is presenter we don't re-render playing state changes
    // Because he's in control of the play/pause status
    if (nextProps.isPresenter && isPresenter && nextState.playing !== playing) {
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProp) {
    // Detect presenter change and redo the sync and listeners to reassign video to the new one
    const { isPresenter } = this.props;
    if (isPresenter !== prevProp.isPresenter) {
      VideoPlayer.clearVideoListeners();

      clearInterval(this.syncInterval);
      clearTimeout(this.autoPlayTimeout);

      this.registerVideoListeners();
    }
  }

  componentWillUnmount() {
    const {
      layoutContextDispatch,
      hidePresentation,
    } = this.props;

    window.removeEventListener('beforeunload', this.onBeforeUnload);

    VideoPlayer.clearVideoListeners();

    clearInterval(this.syncInterval);
    clearTimeout(this.autoPlayTimeout);

    this.player = null;

    layoutContextDispatch({
      type: ACTIONS.SET_HAS_EXTERNAL_VIDEO,
      value: false,
    });

    if (hidePresentation) {
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: false,
      });
    }
  }

  toggleSubtitle() {
    this.setState((state) => {
      return { subtitlesOn: !state.subtitlesOn };
    }, () => {
      const { subtitlesOn } = this.state;
      const { isPresenter } = this.props;
      if (!isPresenter && subtitlesOn) {
        this?.player?.getInternalPlayer()?.setOption('captions', 'reload', true);
      } else {
        this?.player?.getInternalPlayer()?.unloadModule('captions');
      }
    });
  }

  handleOnReady() {
    const { hasPlayedBefore, playerIsReady } = this;

    if (hasPlayedBefore || playerIsReady) {
      return;
    }

    this.playerIsReady = true;

    this.autoPlayTimeout = setTimeout(
      this.autoPlayBlockDetected,
      AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS * 1000,
    );
  }

  handleFirstPlay() {
    const { isPresenter } = this.props;
    const { hasPlayedBefore } = this;

    if (!hasPlayedBefore) {
      this.hasPlayedBefore = true;
      this.setState({ autoPlayBlocked: false });

      clearTimeout(this.autoPlayTimeout);

      if (isPresenter) {
        this.sendSyncMessage('presenterReady');
      }
    }
  }

  handleOnPlay() {
    const { isPresenter } = this.props;
    const { playing } = this.state;

    const curTime = this.getCurrentTime();

    if (isPresenter && !playing) {
      this.sendSyncMessage('play', { time: curTime });
    }
    this.setState({ playing: true });

    this.handleFirstPlay();

    if (!isPresenter && !playing) {
      this.setState({ playing: false });
    }
  }

  handleOnPause() {
    const { isPresenter } = this.props;
    const { playing } = this.state;

    const curTime = this.getCurrentTime();

    if (isPresenter && playing) {
      this.sendSyncMessage('stop', { time: curTime });
    }
    this.setState({ playing: false });

    this.handleFirstPlay();

    if (!isPresenter && playing) {
      this.setState({ playing: true });
    }
  }

  handleOnProgress(data) {
    const { mutedByEchoTest } = this.state;

    const volume = this.getCurrentVolume();
    const muted = this.getMuted();

    const { played, loaded } = data;

    this.setState({played, loaded});

    if (!mutedByEchoTest) {
      this.setState({ volume, muted });
    }
  }

  handleVolumeChanged(volume) {
    this.setState({ volume });
  }

  handleOnMuted(muted) {
    const { mutedByEchoTest } = this.state;

    if (!mutedByEchoTest) {
      this.setState({ muted });
    }
  }

  handleReload() {
    const { key } = this.state;
    // increment key and force a re-render of the video component
    this.setState({ key: key + 1 });
  }

  onBeforeUnload() {
    const { isPresenter } = this.props;

    if (isPresenter) {
      this.sendSyncMessage('stop');
    }
  }

  static getDerivedStateFromProps(props) {
    const { inEchoTest } = props;

    return { mutedByEchoTest: inEchoTest };
  }

  getCurrentTime() {
    if (this.player && this.player.getCurrentTime) {
      return Math.round(this.player.getCurrentTime());
    }
    return 0;
  }

  getCurrentPlaybackRate() {
    const intPlayer = this.player && this.player.getInternalPlayer();
    const rate = (intPlayer && intPlayer.getPlaybackRate && intPlayer.getPlaybackRate());

    return typeof (rate) === 'number' ? rate : 1;
  }

  setPlaybackRate(rate) {
    const intPlayer = this.player && this.player.getInternalPlayer();
    const currentRate = this.getCurrentPlaybackRate();

    if (currentRate === rate) {
      return;
    }

    this.setState({ playbackRate: rate });
    if (intPlayer && intPlayer.setPlaybackRate) {
      intPlayer.setPlaybackRate(rate);
    }
  }

  getCurrentVolume() {
    const { volume } = this.state;
    const intPlayer = this.player && this.player.getInternalPlayer();

    return (intPlayer && intPlayer.getVolume && intPlayer.getVolume() / 100.0) || volume;
  }

  getMuted() {
    const { mutedByEchoTest, muted } = this.state;
    const intPlayer = this.player && this.player.getInternalPlayer();

    return (intPlayer && intPlayer.isMuted && intPlayer.isMuted?.() && !mutedByEchoTest) || muted;
  }

  autoPlayBlockDetected() {
    this.setState({ autoPlayBlocked: true });
  }

  sendSyncMessage(msg, params) {
    const timestamp = Date.now();

    // If message is just a quick pause/un-pause just send nothing
    const sinceLastMessage = (timestamp - this.lastMessageTimestamp) / 1000;
    if ((
      (msg === 'play' && this.lastMessage === 'stop')
      || (msg === 'stop' && this.lastMessage === 'play'))
         && sinceLastMessage < THROTTLE_INTERVAL_SECONDS) {
      return clearTimeout(this.throttleTimeout);
    }

    // Ignore repeat presenter ready messages
    if (this.lastMessage === msg && msg === 'presenterReady') {
      logger.debug('Ignoring a repeated presenterReady message');
    } else {
      // Play/pause messages are sent with a delay, to permit cancelling it in case of
      // quick sucessive play/pauses
      const messageDelay = (msg === 'play' || msg === 'stop') ? THROTTLE_INTERVAL_SECONDS : 0;

      this.throttleTimeout = setTimeout(() => {
        sendMessage(msg, { ...params });
      }, messageDelay * 1000);

      this.lastMessage = msg;
      this.lastMessageTimestamp = timestamp;
    }
    return true;
  }

  registerVideoListeners() {
    const { isPresenter } = this.props;

    if (isPresenter) {
      this.syncInterval = setInterval(() => {
        const { playing } = this.state;
        const curTime = this.getCurrentTime();
        const rate = this.getCurrentPlaybackRate();

        // Always pause video if presenter is has not started sharing, e.g., blocked by autoplay
        const playingState = this.hasPlayedBefore ? playing : false;

        this.sendSyncMessage('playerUpdate', { rate, time: curTime, state: playingState });
      }, SYNC_INTERVAL_SECONDS * 1000);
    } else {
      onMessage('play', ({ time }) => {
        const { hasPlayedBefore, player } = this;

        if (!player || !hasPlayedBefore) {
          return;
        }
        this.seekTo(time);
        this.setState({ playing: true });

        logger.debug({ logCode: 'external_video_client_play' }, 'Play external video');
      });

      onMessage('stop', ({ time }) => {
        const { hasPlayedBefore, player } = this;

        if (!player || !hasPlayedBefore) {
          return;
        }
        this.seekTo(time);
        this.setState({ playing: false });

        logger.debug({ logCode: 'external_video_client_stop' }, 'Stop external video');
      });

      onMessage('presenterReady', () => {
        const { hasPlayedBefore } = this;

        logger.debug({ logCode: 'external_video_presenter_ready' }, 'Presenter is ready to sync');

        if (!hasPlayedBefore) {
          this.setState({ playing: true });
        }
      });

      onMessage('playerUpdate', (data) => {
        const { hasPlayedBefore, player } = this;
        const { playing } = this.state;
        const { time, rate, state } = data;

        if (!player || !hasPlayedBefore) {
          return;
        }

        if (rate !== this.getCurrentPlaybackRate()) {
          this.setPlaybackRate(rate);
          logger.debug({
            logCode: 'external_video_client_update_rate',
            extraInfo: {
              newRate: rate,
            },
          }, 'Change external video playback rate.');
        }

        this.seekTo(time);

        const playingState = getPlayingState(state);
        if (playing !== playingState) {
          this.setState({ playing: playingState });
        }
      });
    }
  }

  seekTo(time) {
    const { player } = this;

    if (!player) {
      return logger.error('No player on seek');
    }

    // Seek if viewer has drifted too far away from presenter
    if (Math.abs(this.getCurrentTime() - time) > SYNC_INTERVAL_SECONDS * 0.75) {
      player.seekTo(time, true);
      logger.debug({
        logCode: 'external_video_client_update_seek',
        extraInfo: { time },
      }, `Seek external video to: ${time}`);
    }
    return true;
  }

  renderFullscreenButton() {
    const { intl, fullscreenElementId, fullscreenContext } = this.props;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <FullscreenButtonContainer
        key={_.uniqueId('fullscreenButton-')}
        elementName={intl.formatMessage(intlMessages.fullscreenLabel)}
        fullscreenRef={this.playerParent}
        elementId={fullscreenElementId}
        isFullscreen={fullscreenContext}
        dark
      />
    );
  }

  render() {
    const {
      videoUrl,
      isPresenter,
      intl,
      top,
      left,
      right,
      height,
      width,
      fullscreenContext,
      isResizing,
    } = this.props;

    const {
      playing, playbackRate, mutedByEchoTest, autoPlayBlocked,
      volume, muted, key, showHoverToolBar, played, loaded, subtitlesOn
    } = this.state;

    // This looks weird, but I need to get this nested player
    const playerName = this.player && this.player.player
      && this.player.player.player && this.player.player.player.constructor.name;

    let toolbarStyle = 'hoverToolbar';

    if (deviceInfo.isMobile && !showHoverToolBar) {
      toolbarStyle = 'dontShowMobileHoverToolbar';
    }

    if (deviceInfo.isMobile && showHoverToolBar) {
      toolbarStyle = 'showMobileHoverToolbar';
    }
    const isMinimized = width === 0 && height === 0;

    return (
      <span
        style={{
          position: 'absolute',
          top,
          left,
          right,
          height,
          width,
          pointerEvents: isResizing ? 'none' : 'inherit',
          display: isMinimized && 'none',
          background: 'var(--color-black)',
        }}
      >
        <Styled.VideoPlayerWrapper
          id="video-player"
          data-test="videoPlayer"
          fullscreen={fullscreenContext}
          ref={(ref) => { this.playerParent = ref; }}
        >
          {
            autoPlayBlocked
              ? (
                <Styled.AutoPlayWarning>
                  {intl.formatMessage(intlMessages.autoPlayWarning)}
                </Styled.AutoPlayWarning>
              )
              : ''
          }

          <Styled.VideoPlayer
            url={videoUrl}
            config={this.opts}
            volume={(muted || mutedByEchoTest) ? 0 : volume}
            muted={muted || mutedByEchoTest}
            playing={playing}
            playbackRate={playbackRate}
            onProgress={this.handleOnProgress}
            onReady={this.handleOnReady}
            onPlay={this.handleOnPlay}
            onPause={this.handleOnPause}
            controls={isPresenter}
            key={`react-player${key}`}
            ref={(ref) => { this.player = ref; }}
            height="100%"
            width="100%"
          />
          {
            !isPresenter
              ? [
                (
                  <Styled.HoverToolbar key="hover-toolbar-external-video">
                    <VolumeSlider
                      hideVolume={this.hideVolume[playerName]}
                      volume={volume}
                      muted={muted || mutedByEchoTest}
                      onMuted={this.handleOnMuted}
                      onVolumeChanged={this.handleVolumeChanged}
                    />
                    <Styled.ButtonsWrapper>
                      <ReloadButton
                        handleReload={this.handleReload}
                        label={intl.formatMessage(intlMessages.refreshLabel)}
                      />
                      {playerName === 'YouTube' && (
                        <Subtitles
                          toggleSubtitle={this.toggleSubtitle}
                          label={subtitlesOn
                            ? intl.formatMessage(intlMessages.subtitlesOn)
                            : intl.formatMessage(intlMessages.subtitlesOff)
                          }
                        />
                      )}
                    </Styled.ButtonsWrapper>
                    {this.renderFullscreenButton()}

                    <Styled.ProgressBar>
                      <Styled.Loaded
                        style={{ width: loaded * 100 + '%' }}
                      >
                        <Styled.Played
                          style={{ width: played * 100 / loaded + '%'}}
                        />
                      </Styled.Loaded>
                    </Styled.ProgressBar>
                  </Styled.HoverToolbar>
                ),
                (deviceInfo.isMobile && playing) && (
                  <Styled.MobileControlsOverlay
                    key="mobile-overlay-external-video"
                    ref={(ref) => { this.overlay = ref; }}
                    onTouchStart={() => {
                      clearTimeout(this.mobileHoverSetTimeout);
                      this.setState({ showHoverToolBar: true });
                    }}
                    onTouchEnd={() => {
                      this.mobileHoverSetTimeout = setTimeout(
                        () => this.setState({ showHoverToolBar: false }),
                        5000,
                      );
                    }}
                  />
                ),
              ]
              : null
          }
        </Styled.VideoPlayerWrapper>
      </span>
    );
  }
}

VideoPlayer.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  fullscreenElementId: PropTypes.string.isRequired,
  fullscreenContext: PropTypes.bool.isRequired,
};

export default injectIntl(injectWbResizeEvent(VideoPlayer));