import loadScript from 'load-script';
import React, { Component } from 'react'

const MATCH_URL = new RegExp("(https?)://(.*)/videos/watch/(.*)");

const SDK_URL = 'https://unpkg.com/@peertube/embed-api/build/player.min.js';

// Util function to load an external SDK or return the SDK if it is already loaded
// From https://github.com/CookPete/react-player/blob/master/src/utils.js
const resolves = {};
export function getSDK (url, sdkGlobal, sdkReady = null, isLoaded = () => true, fetchScript = loadScript) {
  if (window[sdkGlobal] && isLoaded(window[sdkGlobal])) {
    return Promise.resolve(window[sdkGlobal])
  }
  return new Promise((resolve, reject) => {
    // If we are already loading the SDK, add the resolve
    // function to the existing array of resolve functions
    if (resolves[url]) {
      resolves[url].push(resolve);
      return
    }
    resolves[url] = [resolve];
    const onLoaded = sdk => {
      // When loaded, resolve all pending promises
      resolves[url].forEach(resolve => resolve(sdk))
    };
    if (sdkReady) {
      const previousOnReady = window[sdkReady];
      window[sdkReady] = function () {
        if (previousOnReady) previousOnReady();
        onLoaded(window[sdkGlobal])
      }
    }
    fetchScript(url, err => {
      if (err) {
        reject(err);
      }
      window[sdkGlobal] = url;
      if (!sdkReady) {
        onLoaded(window[sdkGlobal])
      }
    })
  })
}

export class PeerTubePlayer extends Component {
  static displayName = 'PeerTubePlayer';

  static canPlay = url => {
    return MATCH_URL.test(url)
  };

  constructor(props) {
    super(props);

    this.player = this;
    this._player = null;

    this.currentTime = 0;
    this.playbackRate = 1;
    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.getEmbedUrl = this.getEmbedUrl.bind(this);
    this.setupEvents = this.setupEvents.bind(this);
  }

  componentDidMount () {
    this.props.onMount && this.props.onMount(this)
  }

  getEmbedUrl = () => {
    const { config, url } = this.props;
    const m = MATCH_URL.exec(url);

    const isPresenter = config && config.peertube && config.peertube.isPresenter;

    return `${m[1]}://${m[2]}/videos/embed/${m[3]}?api=1&controls=${true}`;
  };

  load() {
    new Promise((resolve, reject) => {
      this.render();
      resolve();
    })
    .then(() => { return getSDK(SDK_URL, 'PeerTube') })
    .then(() => {
      this._player = new window['PeerTubePlayer'](this.container);

      this.setupEvents();

      return this._player.ready.then(() => {
        return this.props.onReady();
      });
    });
  }

  setupEvents(event) {
    const player = this._player;

    if (!player) {
      return;
    }

    player.addEventListener("playbackStatusUpdate", (data) => {
      this.currentTime = data.position;
    });
    player.addEventListener("playbackStatusChange", (data) => {
      if (data === 'playing') {
        this.props.onPlay();
      } else {
        this.props.onPause();
      }
    });

  }

  play() {
    if (this._player) {
      this._player.play();
    }
  }

  pause() {
    if (this._player) {
      this._player.pause();
    }
  }

  stop() {
  }

  seekTo(seconds) {
    if (this._player) {
      this._player.seek(seconds);
    }
  }

  setVolume(fraction) {
    // console.log("SET VOLUME");
  }

  setLoop(loop) {
    // console.log("SET LOOP");
  }

  mute() {
    // console.log("SET MUTE");
  }

  unmute() {
    // console.log("SET UNMUTE");
  }

  getDuration() {
    //console.log("GET DURATION");
  }

  getCurrentTime () {
    return this.currentTime;
  }

  getSecondsLoaded () {
  }

  getPlaybackRate () {

    if (this._player) {
      this._player.getPlaybackRate().then((rate) => {
        this.playbackRate = rate;
      });
    }

    return this.playbackRate;
  }

  setPlaybackRate (rate) {

    if (this._player) {
      this._player.setPlaybackRate(rate);
    }
  }

  render () {
    const style = {
      width: '100%',
      height: '100%',
      margin: 0,
      padding: 0,
      border: 0,
      overflow: 'hidden',
    };
    const { url } = this.props;

    return (
      <iframe
        key={url}
        style={style}
        src={this.getEmbedUrl(url)}
        id={"peerTubeContainer"}
        allow="autoplay; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups"
        ref={(container) => {
          this.container = container;
        }}
      >
      </iframe>
    )
  }
}

export default PeerTubePlayer;

