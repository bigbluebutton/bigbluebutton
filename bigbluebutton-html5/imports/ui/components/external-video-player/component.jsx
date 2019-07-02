import React, { Component } from 'react';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import YouTube from 'react-youtube';
import { sendMessage, onMessage } from './service';
import logger from '/imports/startup/client/logger';

const { PlayerState } = YouTube;

const SYNC_INTERVAL_SECONDS = 2;

class VideoPlayer extends Component {
  constructor(props) {
    super(props);

    this.player = null;
    this.syncInterval = null;
    this.playerState = PlayerState.UNSTARTED;
    this.presenterCommand = false;
    this.preventStateChange = false;
    this.state = {
      mutedByEchoTest: false,
    };

    this.opts = {
      playerVars: {
        width: '100%',
        height: '100%',
        autoplay: 1,
        modestbranding: true,
        rel: 0,
        ecver: 2,
      },
    };

    this.keepSync = this.keepSync.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleOnReady = this.handleOnReady.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.changeState = this.changeState.bind(this);
    this.resizeListener = () => {
      setTimeout(this.handleResize, 0);
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeListener);
  }

  componentDidUpdate(prevProps) {
    const { inEchoTest } = this.props;
    const {
      mutedByEchoTest,
    } = this.state;

    if (inEchoTest && !this.player.isMuted() && !mutedByEchoTest) {
      this.player.mute();
      this.changeState(true);
    }

    if (!inEchoTest && prevProps.inEchoTest && mutedByEchoTest) {
      this.player.unMute();
      this.changeState(false);
    }

    if (!prevProps.videoId) {
      clearInterval(this.syncInterval);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);

    clearInterval(this.syncInterval);
    this.player = null;
    this.refPlayer = null;
  }

  changeState(booleanValue) {
    this.setState({ mutedByEchoTest: booleanValue });
  }

  handleResize() {
    if (!this.player || !this.refPlayer) {
      return;
    }

    const el = this.refPlayer;
    const parent = el.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    const idealW = h * 16 / 9;

    if (idealW > w) {
      this.player.setSize(w, w * 9 / 16);
    } else {
      this.player.setSize(idealW, h);
    }
  }

  keepSync() {
    const { isPresenter } = this.props;

    if (isPresenter) {
      this.syncInterval = setInterval(() => {
        const curTime = this.player.getCurrentTime();
        const rate = this.player.getPlaybackRate();
        sendMessage('playerUpdate', { rate, time: curTime, state: this.playerState });
      }, SYNC_INTERVAL_SECONDS * 1000);
    } else {
      onMessage('play', ({ time }) => {
        this.presenterCommand = true;
        if (this.player) {
          this.player.seekTo(time, true);
          this.playerState = PlayerState.PLAYING;
          this.player.playVideo();
        }
        logger.debug({ logCode: 'external_video_client_play' }, 'Play external video');
      });

      onMessage('stop', ({ time }) => {
        this.presenterCommand = true;

        if (this.player) {
          this.playerState = PlayerState.PAUSED;
          this.player.seekTo(time, true);
          this.player.pauseVideo();
        }
        logger.debug({ logCode: 'external_video_client_stop' }, 'Stop external video');
      });

      onMessage('playerUpdate', (data) => {
        if (!this.player) {
          return;
        }

        if (data.rate !== this.player.getPlaybackRate()) {
          this.player.setPlaybackRate(data.rate);
          logger.debug({
            logCode: 'external_video_client_update_rate',
            extraInfo: {
              newRate: data.rate,
            },
          }, 'Change external video playback rate.');
        }

        if (Math.abs(this.player.getCurrentTime() - data.time) > SYNC_INTERVAL_SECONDS) {
          this.player.seekTo(data.time, true);
          logger.debug({
            logCode: 'external_video_client_update_seek',
            extraInfo: {
              time: data.time,
            },
          }, 'Seek external video to:');
        }

        if (this.playerState !== data.state) {
          this.presenterCommand = true;
          this.playerState = data.state;
          if (this.playerState === PlayerState.PLAYING) {
            this.player.playVideo();
            logger.debug({ logCode: 'external_video_client_prevent_pause' }, 'Prevent pause external video');
          } else {
            this.player.pauseVideo();
            logger.debug({ logCode: 'external_video_client_prevent_play' }, 'Prevent play external video');
          }
        }
      });
    }
  }

  handleOnReady(event) {
    const { isPresenter } = this.props;

    this.player = event.target;
    this.player.pauseVideo();

    this.keepSync();

    if (!isPresenter) {
      sendMessage('viewerJoined');
    } else {
      this.player.playVideo();
    }

    this.handleResize();
  }

  handleStateChange(event) {
    const { isPresenter } = this.props;
    const curTime = this.player.getCurrentTime();

    if (this.preventStateChange && [PlayerState.PLAYING, PlayerState.PAUSED].includes(event.data)) {
      this.preventStateChange = false;
      return;
    }

    if (this.playerState === event.data) {
      return;
    }

    if (event.data === PlayerState.PLAYING) {
      if (isPresenter) {
        sendMessage('play', { time: curTime });
        this.playerState = event.data;
      } else if (!this.presenterCommand) {
        this.player.seekTo(curTime, true);
        this.preventStateChange = true;
        this.player.pauseVideo();
      } else {
        this.playerState = event.data;
        this.presenterCommand = false;
      }
    } else if (event.data === PlayerState.PAUSED) {
      if (isPresenter) {
        sendMessage('stop', { time: curTime });
        this.playerState = event.data;
      } else if (!this.presenterCommand) {
        this.player.seekTo(curTime);
        this.preventStateChange = true;
        this.player.playVideo();
      } else {
        this.playerState = event.data;
        this.presenterCommand = false;
      }
    }
  }

  render() {
    const { videoId } = this.props;
    const { opts, handleOnReady, handleStateChange } = this;

    return (
      <div
        id="youtube-video-player"
        data-test="videoPlayer"
        ref={(ref) => { this.refPlayer = ref; }}
      >
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={handleOnReady}
          onStateChange={handleStateChange}
        />
      </div>
    );
  }
}

export default injectWbResizeEvent(VideoPlayer);
