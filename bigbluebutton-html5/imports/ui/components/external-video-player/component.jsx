import React, {Component} from "react";
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import Icon from '../icon/component';

import YouTube from 'react-youtube';

import Service from './service';

const intlMessages = defineMessages({
});

const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
}

class VideoPlayer extends Component {

  player = null;
  syncInterval = null;
  playerState = PlayerState.UNSTARTED;
  presenterCommand = false;
  preventStateChange = false;

  opts = {
    playerVars: {
      width: '100%',
      height: '100%',
      autoplay: 1,
      modestbranding: true,
      rel: 0,
      ecver: 2,
    }
  };

  componentDidMount() {
    window.addEventListener('resize', () => {
      setTimeout(this.handleResize, 0);
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => {
      setTimeout(this.handleResize, 0);
    });
  }

  handleResize = () => {
    let el = this.refPlayer;

    if (!this.player || !el)
      return;

    let parent = el.parentElement;
    let w = parent.clientWidth;
    let h = parent.clientHeight;
    let idealW = h * 16/9;

    if (idealW > w) {
      this.player.setSize(w, w * 9/16);
    } else {
      this.player.setSize(idealW, h);
    }
  }

  keepSync = () => {
    let { isPresenter } = this.props;

    if (isPresenter) {

      this.syncInterval = setInterval(() => {
        let curTime = this.player.getCurrentTime();
        let rate = this.player.getPlaybackRate();
        Service.sendMessage('playerUpdate', {rate, time: curTime, state: this.playerState});
      }, 2000);

    } else {

      Service.onMessage('play', ({time, state}) => {
        this.presenterCommand = true;
        if (this.player) {
          this.player.seekTo(time, true);
          this.playerState = PlayerState.PLAYING;
          this.player.playVideo();
        }
      });

      Service.onMessage('stop', ({time}) => {
        this.presenterCommand = true;

        if (this.player) {
          this.playerState = PlayerState.PAUSED;
          this.player.seekTo(time, true);
          this.player.pauseVideo();
        }
      });

      Service.onMessage('playerUpdate', (data) => {
        if (!this.player) {
          return;
        }

        if (data.rate != this.player.getPlaybackRate()) {
          this.player.setPlaybackRate(data.rate);
        }

        if (Math.abs(this.player.getCurrentTime() - data.time) > 2) {
          this.player.seekTo(data.time, true);
        }

        if (this.playerState !== data.state) {
          this.presenterCommand = true;
          this.playerState = data.state;
          if (this.playerState === PlayerState.PLAYING) {
            this.player.playVideo();
          } else {
            this.player.pauseVideo();
          }
        }
      });

      Service.onMessage('changePlaybackRate', (rate) => {
        this.player.setPlaybackRate(rate);
      });

    }
  }

  handleOnReady = (event) => {
    let { isPresenter } = this.props;

    this.player = event.target;
    this.player.pauseVideo();

    this.keepSync();

    if (!isPresenter) {
      Service.sendMessage('viewerJoined');
    } else {
      this.player.playVideo();
    }

    this.handleResize();
  };

  handleStateChange = (event) => {
    let { isPresenter } = this.props;
    let curTime = this.player.getCurrentTime();

    if (this.preventStateChange && [PlayerState.PLAYING, PlayerState.PAUSED].includes(event.data)) {
      this.preventStateChange = false;
      return;
    }

    if (this.playerState === event.data) {
      return;
    }

    if (event.data === PlayerState.PLAYING) {

      if (isPresenter) {
        Service.sendMessage('play', {time: curTime});
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
        Service.sendMessage('stop', {time: curTime});
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
  };

  componentWillUnmount() {
    clearInterval(this.syncInterval);
  }

  render () {
    return (
      <div
        id="youtube-video-player"
        data-test="videoPlayer"
        ref={(ref) => { this.refPlayer = ref; } }
      >
        <YouTube
          videoId={this.props.videoId}
          opts={this.opts}
          onReady={this.handleOnReady}
          onStateChange={this.handleStateChange}
          />
      </div>
    );
  }
}

export default injectWbResizeEvent(injectIntl(VideoPlayer));
