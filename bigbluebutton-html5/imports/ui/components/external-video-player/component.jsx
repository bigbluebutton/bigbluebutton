import React, { Component } from 'react';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import ReactPlayer from 'react-player';
import { sendMessage, onMessage } from './service';
import logger from '/imports/startup/client/logger';

import ArcPlayer from './custom-players/arc-player';


import { styles } from './styles';

const SYNC_INTERVAL_SECONDS = 2;

ReactPlayer.addCustomPlayer(ArcPlayer);

class VideoPlayer extends Component {
  constructor(props) {
    super(props);

    const { isPresenter } = props;

    this.player = null;
    this.syncInterval = null;
    this.state = {
      mutedByEchoTest: false,
      playing: false,
      playbackRate: 1,
    };

    this.opts = {
      controls: isPresenter,
      youtube: {
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          autohide: 1,
          rel: 0,
          ecver: 2,
          controls: isPresenter ? 1 : 2,
        },
      },
      preload: true,
    };

    this.keepSync = this.keepSync.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleOnReady = this.handleOnReady.bind(this);
    this.handleOnPlay = this.handleOnPlay.bind(this);
    this.handleOnPause = this.handleOnPause.bind(this);
    this.resizeListener = () => {
      setTimeout(this.handleResize, 0);
    };
    this.keepSync();
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeListener);

    clearInterval(this.syncInterval);
    // this.keepSync();
  }

  componentDidUpdate(prevProps) {
    const { inEchoTest } = this.props;
    const {
      mutedByEchoTest,
    } = this.state;

    if (inEchoTest && !this.player.isMuted() && !mutedByEchoTest) {
      this.setState({ mutedByEchoTest: true });
    }

    if (!inEchoTest && prevProps.inEchoTest && mutedByEchoTest) {
      this.setState({ mutedByEchoTest: false });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);

    clearInterval(this.syncInterval);
    this.player = null;
  }

  getCurrentPlaybackRate() {
    const intPlayer = this.player.getInternalPlayer();

    return (intPlayer && intPlayer.getPlaybackRate && intPlayer.getPlaybackRate()) || 1;
  }

  handleResize() {
    if (!this.player || !this.playerParent) {
      return;
    }

    const par = this.playerParent.parentElement;
    const w = par.clientWidth;
    const h = par.clientHeight;
    const idealW = h * 16 / 9;

    const style = {};
    if (idealW > w) {
      style.width = w;
      style.height = w * 9 / 16;
    } else {
      style.width = idealW;
      style.height = h;
    }

    const styleStr = `width: ${style.width}px; height: ${style.height}px;`;
    this.player.wrapper.style = styleStr;
    this.playerParent.style = styleStr;
  }

  keepSync() {
    const { isPresenter } = this.props;
    const { playing } = this.state;

    if (isPresenter) {
      this.syncInterval = setInterval(() => {
        const curTime = this.player.getCurrentTime();
        const rate = this.getCurrentPlaybackRate();

        sendMessage('playerUpdate', { rate, time: curTime, state: playing });
      }, SYNC_INTERVAL_SECONDS * 1000);
    } else {
      onMessage('play', ({ time }) => {
        if (!this.player) {
          return;
        }

        this.player.seekTo(time);
        this.setState({ playing: true });

        logger.debug({ logCode: 'external_video_client_play' }, 'Play external video');
      });

      onMessage('stop', ({ time }) => {
        if (!this.player) {
          return;
        }
        this.player.seekTo(time);
        this.setState({ playing: false });

        logger.debug({ logCode: 'external_video_client_stop' }, 'Stop external video');
      });

      onMessage('playerUpdate', (data) => {
        if (!this.player) {
          return;
        }

        if (data.rate !== this.player.props.playbackRate) {
          this.setState({ playbackRate: data.rate });
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

        if (playing !== data.state) {
          this.setState({ playing: data.state });
        }
      });
    }
  }

  handleOnReady() {
    const { isPresenter } = this.props;

    if (!isPresenter) {
      sendMessage('viewerJoined');
    }

    this.handleResize();
  }

  handleOnPlay() {
    const { isPresenter } = this.props;
    const curTime = this.player.getCurrentTime();

    if (isPresenter) {
      sendMessage('play', { time: curTime });
    }
    this.setState({ playing: true });
  }

  handleOnPause() {
    const { isPresenter } = this.props;
    const curTime = this.player.getCurrentTime();

    if (isPresenter) {
      sendMessage('stop', { time: curTime });
    }
    this.setState({ playing: false });
  }

  render() {
    const { videoUrl } = this.props;
    const { playing, playbackRate, mutedByEchoTest } = this.state;

    return (
      <div
        id="video-player"
        data-test="videoPlayer"
        ref={(ref) => { this.playerParent = ref; }}
      >
        <ReactPlayer
          className={styles.videoPlayer}
          url={videoUrl}
          config={this.opts}
          muted={mutedByEchoTest}
          playing={playing}
          playbackRate={playbackRate}
          onReady={this.handleOnReady}
          onPlay={this.handleOnPlay}
          onPause={this.handleOnPause}
          ref={(ref) => { this.player = ref; }}
        />
      </div>
    );
  }
}

export default injectWbResizeEvent(VideoPlayer);
