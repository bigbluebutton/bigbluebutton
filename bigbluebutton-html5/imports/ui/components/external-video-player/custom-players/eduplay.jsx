import React, { Component } from 'react'

const MATCH_URL = new RegExp("https?://(hmg.)?(eduplay.rnp.br)/portal/(videolive|video|tv|channel|radio|podcast)/(.*)");

export default class Eduplay extends Component {
  static displayName = 'Eduplay'

  static canPlay = url => {
    return MATCH_URL.test(url)
  }

  componentDidMount() {
    this.props.onMount && this.props.onMount(this);
  }

  load(url, isReady) {
    this.player = this;

    setTimeout(() => { this.props.onReady() }, 0);

    this.currentTime = 0;
    this.updateCurrentTime = this.updateCurrentTime.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
    this.postMessage = this.postMessage.bind(this);

    window.addEventListener("message", this.handleEvent, false);
  }

  handleEvent(event) {

    if (event.origin !== this.getHostUrl()) {
      return;
    }

    let data = JSON.parse(event.data);
    if (data.event === 'onPlay') {
      return this.props.onPlay && this.props.onPlay();
    } else if (data.event === 'onPause') {
      return this.props.onPause && this.props.onPause();
    } else if (data.event === 'onTime') {
      return this.updateCurrentTime(data.playerPosition);
    }
  }

  updateCurrentTime(e) {
    this.currentTime = e;
  }

  getVideoId() {
    const { url } = this.props;
    const m = url.match(MATCH_URL);
    return m && m[4];
  }

  getHostUrl() {
    const { url } = this.props;
    const m = url.match(MATCH_URL);
    return m && 'https://' + (m[1] || '') + m[2];
  }

  getVideoType() {
    const { url } = this.props;
    const m = url.match(MATCH_URL);
    return m && m[3];
  }

  getEmbedUrl() {
    const { config } = this.props;
    const remoteControl = config.eduplay && config.eduplay.remoteControl;
    return this.getHostUrl() + '/portal/' + this.getVideoType() + '/embed/' + this.getVideoId() + (remoteControl ? "/remote-control" : '');
  }

  postMessage(obj) {
    if (this.container && this.container.contentWindow) {
      this.container.contentWindow.postMessage(JSON.stringify(obj), "*");
    }
  }

  play() {
    this.postMessage({event: 'play'});
  }

  pause() {
    this.postMessage({event: 'pause'});
  }

  stop() {
  }

  seekTo(seconds) {
    this.postMessage({event: 'seek', playerPosition: seconds});
  }

  setVolume(fraction) {
  }

  setLoop(loop) {
  }

  mute() {
  }

  unmute() {
  }

  getDuration() {
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getSecondsLoaded () {
  }

  render () {
    const style = {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: 'black'
    }
    return (
      <div
        key={this.props.url}
        style={style}>
        <iframe
          width="100%"
          height="100%"
          src={this.getEmbedUrl()}
          allowFullScreen={true}
          frameBorder="0"
          scrolling="0"
          ref={(container) => {
            return this.container = container;
          }}
        />
      </div>
    )
  }
}

