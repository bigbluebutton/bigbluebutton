import loadScript from 'load-script';
import React, { Component } from 'react'

const MATCH_URL = new RegExp("https?:\/\/(.*)(instructuremedia.com)(\/embed)?\/([-abcdef0-9]+)");

const SDK_URL = 'https://files.instructuremedia.com/instructure-media-script/instructure-media-1.1.0.js';

const EMBED_PATH = "/embed/";

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

export class ArcPlayer extends Component {
  static displayName = 'ArcPlayer';

  static canPlay = url => {
    return MATCH_URL.test(url)
  };

  constructor(props) {
    super(props);

    this.currentTime = 0;
    this.updateCurrentTime = this.updateCurrentTime.bind(this);
    this.getCurrentTime = this.getCurrentTime.bind(this);
    this.getEmbedUrl = this.getEmbedUrl.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
  }

  componentDidMount () {
    this.props.onMount && this.props.onMount(this)
  }

  load() {
    new Promise((resolve, reject) => {
      this.render();
      resolve();
    })
    .then(() => { return getSDK(SDK_URL, 'ArcPlayer') })
    .then(() => {
      this.player = new InstructureMedia.Player('arcPlayerContainer', {
        height: '100%',
        width: '100%',
        embedUrl: this.getEmbedUrl(),
        events: {
          onStateChange: this.onStateChange,
        }
      });
      this.player.playVideo();
    });
  }

  onStateChange(event) {
    if (!this.player) {
      return;
    }

    this.player.getCurrentTime().then((t) => {
      this.updateCurrentTime(t.data);
    });

    if (event.data === "CUED") {
      this.props.onReady();
    } else if (event.data === "PLAYING") {
      this.props.onPlay && this.props.onPlay();
    } else if (event.data === "PAUSED") {
      this.props.onPause && this.props.onPause();
    } else if (event.data === "SEEKED") {
      // TODO
    } else if (event.data === "SEEKING") {
      // TODO
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
    return m && 'https://' + m[1] + m[2];
  }

  getEmbedUrl() {
    let url = this.getHostUrl() + EMBED_PATH + this.getVideoId();
    return url;
  }

  play() {
    if (this.player) {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.player) {
      this.player.pauseVideo();
    }
  }

  stop() {
    // TODO: STOP
  }

  seekTo(seconds) {
    if (this.player) {
      this.player.seekTo(seconds);
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
    if (this.player) {
      this.player.getCurrentTime().then((t) => {
        this.updateCurrentTime(t.data);
      });
    }

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
    };
    return (
      <div
        key={this.props.url}
        style={style}
        id={"arcPlayerContainer"}
        ref={(container) => {
          this.container = container;
        }}
      >
      </div>
    )
  }
}

export default ArcPlayer;

