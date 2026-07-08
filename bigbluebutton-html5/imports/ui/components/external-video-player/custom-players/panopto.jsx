import loadScript from 'load-script';
import React, { Component } from 'react';

// Tenant-agnostic: matches any Panopto host (*.panopto.com, *.panopto.eu, self-hosted)
const MATCH_URL = /^https?:\/\/([^/]+)\/Panopto\/Pages\/Viewer\.aspx\?id=([-a-zA-Z0-9]+)$/;

const SDK_URL = 'https://developers.panopto.com/scripts/embedapi.min.js';

// The SDK script defines window.EmbedApi; 'PanoptoEmbedApi' is only the
// loaded-flag key used by getSDK (it must differ from the real global,
// which getSDK overwrites with the script URL).
const SDK_GLOBAL = 'PanoptoEmbedApi';

const PLAYER_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
};

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
        return;
      }
      window[sdkGlobal] = url;
      if (!sdkReady) {
        onLoaded(window[sdkGlobal])
      }
    })
  })
}

export class PanoptoPlayer extends Component {
  static displayName = 'PanoptoPlayer';

  static canPlay = url => {
    return MATCH_URL.test(url)
  };

  constructor(props) {
    super(props);

    this.player = this;
    this._player = null;
    // Instance-specific so two mounted players never share a DOM id
    this.containerId = `panoptoPlayerContainer-${Math.random().toString(36).slice(2)}`;

    this.onIframeReady = this.onIframeReady.bind(this);
    this.onReady = this.onReady.bind(this);
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
    .then(() => { return getSDK(SDK_URL, SDK_GLOBAL) })
    .then(() => {
      const m = this.props.url.match(MATCH_URL);

      if (!m) {
        return;
      }

      // The SDK builds the Embed.aspx iframe src itself, only from the
      // regex-validated host (m[1]) and session id (m[2]) captured above -
      // never from the raw user input - and drives it over postMessage.
      this._player = new window.EmbedApi(this.containerId, {
        width: '100%',
        height: '100%',
        serverName: m[1],
        sessionId: m[2],
        videoParams: {
          // same semantics as the youtube playerVars autoplay: 1 - the embed
          // starts on share and the presenter's onPlay broadcast follows
          autoplay: true,
          interactivity: 'none',
          showtitle: false,
          showbrand: false,
          offerviewer: false,
        },
        events: {
          onIframeReady: this.onIframeReady,
          onReady: this.onReady,
          onStateChange: this.onStateChange,
        },
      });
    })
    .catch((err) => {
      if (this.props.onError) {
        this.props.onError(err);
      }
    });
  }

  onIframeReady() {
    // Dismiss the embed splash screen so the player loads and starts
    // emitting state updates (required before any playback control works)
    this._player.loadVideo();
  }

  onReady() {
    this.props.onReady();
  }

  onStateChange(state) {
    if (state === PLAYER_STATE.PLAYING) {
      this.props.onPlay();
    } else if (state === PLAYER_STATE.PAUSED) {
      this.props.onPause();
    } else if (state === PLAYER_STATE.ENDED) {
      this.props.onEnded();
    }
  }

  play() {
    if (this._player) {
      this._player.playVideo();
    }
  }

  pause() {
    if (this._player) {
      this._player.pauseVideo();
    }
  }

  stop() {
    if (this._player) {
      this._player.stopVideo();
    }
  }

  seekTo(seconds) {
    if (this._player) {
      this._player.seekTo(seconds);
    }
  }

  setVolume(fraction) {
    if (this._player) {
      this._player.setVolume(fraction);
    }
  }

  getVolume() {
    return this._player?.getVolume() ?? 1;
  }

  setLoop(loop) {
  }

  mute() {
    if (this._player) {
      this._player.muteVideo();
    }
  }

  unmute() {
    if (this._player) {
      this._player.unmuteVideo();
    }
  }

  isMuted() {
    return this._player?.isMuted() ?? false;
  }

  getDuration() {
    return this._player?.getDuration() ?? 0;
  }

  getCurrentTime () {
    return this._player?.getCurrentTime() ?? 0;
  }

  getSecondsLoaded () {
    // The Embed API does not expose buffered ranges
    return 0;
  }

  getPlaybackRate () {
    return this._player?.getPlaybackRate() ?? 1;
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
      backgroundColor: 'black',
    };

    return (
      <div
        key={this.props.url}
        style={style}
        id={this.containerId}
        ref={(container) => {
          this.container = container;
        }}
      >
      </div>
    )
  }
}

export default PanoptoPlayer;
