import React, { Component } from 'react';
import { callPlayer } from 'react-player/lib/utils';

export default class PanoptoPlayer extends Component {
  static displayName = 'Panopto';
  static canPlay = (url) => /panopto\.com\/Panopto\/Pages\/Viewer\.aspx/i.test(url);

  iframeRef = React.createRef();

  componentDidMount() {
    this.load(this.props.url);
  }

  componentDidUpdate(prevProps) {
    if (this.props.url !== prevProps.url) {
      this.load(this.props.url);
    }

    if (this.props.playing && !prevProps.playing) {
      this.play();
    } else if (!this.props.playing && prevProps.playing) {
      this.pause();
    }
  }

  componentWillUnmount() {
    this.stop();
  }

  load = (url) => {
    if (!url) return;

    // Convert Viewer.aspx to Embed.aspx (per Panopto Embed API)
    const embedUrl = url
      .replace('/Viewer.aspx', '/Embed.aspx')
      .replace('autoplay=true', 'autoplay=false');

    if (this.iframeRef.current) {
      this.iframeRef.current.src = embedUrl;
    }
  };

  // --- Player API methods ---
  play = () => {
    callPlayer(this, 'play');
  };

  pause = () => {
    callPlayer(this, 'pause');
  };

  stop = () => {
    if (this.iframeRef.current) {
      this.iframeRef.current.src = '';
    }
  };

  seekTo = (seconds) => {
    if (this.iframeRef.current && this.iframeRef.current.contentWindow) {
      this.iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'seek', time: seconds }),
        '*'
      );
    }
  };

  setVolume = () => {
    console.warn('PanoptoPlayer: volume control not supported via Embed API');
  };

  mute = () => {
    console.warn('PanoptoPlayer: mute not supported via Embed API');
  };

  unmute = () => {
    console.warn('PanoptoPlayer: unmute not supported via Embed API');
  };

  getDuration = () => null;
  getCurrentTime = () => null;
  getSecondsLoaded = () => null;

  render() {
    const { width, height, controls } = this.props;
    return (
      <div style={{ width, height, position: 'relative' }}>
        <iframe
          ref={this.iframeRef}
          title="Panopto Player"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{ border: 0 }}
        />
        {!controls && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    );
  }
}

