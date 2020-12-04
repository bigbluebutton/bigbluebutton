import React, { Component } from 'react';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FullscreenService from '../fullscreen-button/service';
import FullscreenButtonContainer from '../fullscreen-button/container';
import { defineMessages, injectIntl } from 'react-intl';
import VncDisplay from 'react-vnc-display';
import Auth from '/imports/ui/services/auth';

import { styles } from './styles';

const propTypes = {
  remoteDesktopUrl: PropTypes.string,
};

const intlMessages = defineMessages({
  remoteDesktopLabel: {
    id: 'app.remoteDesktop.remoteDesktopLabel',
    description: 'remote desktop element label',
  },
});

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;
const START_VIEWONLY = Meteor.settings.public.remoteDesktop.startLocked;

class RemoteDesktop extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isFullscreen: false,
      resized: false,
      remoteDesktopUrl: remoteDesktopUrl,
      viewOnly: START_VIEWONLY,
    };

    this.player = null;
    this.handleResize = this.handleResize.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.resizeListener = () => {
      setTimeout(this.handleResize, 0);
    };

    /* window.remoteDesktop is globally accessible so that the lock button can access it */
    window.remoteDesktop = this;
  }

  componentDidMount() {
    window.addEventListener('layoutSizesSets', this.resizeListener);
    this.playerParent.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  componentWillUnmount() {
    window.removeEventListener('layoutSizesSets', this.resizeListener);
    this.playerParent.removeEventListener('fullscreenchange', this.onFullscreenChange);
    delete window.remoteDesktop;
  }

  handleResize() {

    /* The first time through this code, it's likely that this.playerParent
     * won't be set yet, and that means the full screen component won't
     * work right.  The simplest way I've found to fix this is to set
     * some kind of state variable here, which forces a re-render the
     * first time it toggles from false to true, and that fixes the problem
     * with the full screen component.
     *
     * Strictly speaking, this has nothing to do with a resize.
     */
    this.setState({resized: true});

    if (!this.player || !this.playerParent) {
      return;
    }

    // There's currently a "FIXME: Use ResizeObserver" comment in the noVNC code.
    // Until noVNC can listen for resize events, this is how we tell it its geometry has changed.
    // Once that's fixed, there should be no need for a componentDidUpdate function at all.
    this.player.rfb._windowResize();
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(this.playerParent);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
    }
    setTimeout(this.handleResize, 0);
  }

  onConnect = () => {
      /* We have to handshake a bit with the VNC server before
       * we know the remote screen geometry.  Therefore, once
       * we finish connecting, schedule a resize.
       */
      setTimeout(this.handleResize, 0);
  }

  renderFullscreenButton() {
    const { intl } = this.props;
    const { isFullscreen } = this.state;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <FullscreenButtonContainer
        key={_.uniqueId('fullscreenButton-')}
        elementName={intl.formatMessage(intlMessages.remoteDesktopLabel)}
        fullscreenRef={this.playerParent}
        isFullscreen={isFullscreen}
        dark
      />
    );
  }

  render() {
    var { remoteDesktopUrl, viewOnly } = this.state;

    if (remoteDesktopUrl) {
      const url = new URL(remoteDesktopUrl);
      this.vncPassword = url.searchParams.get('password');

      for (var id of ['meetingID', 'userID', 'fullname', 'confname', 'externUserID']) {
          remoteDesktopUrl = remoteDesktopUrl.replace('{' + id + '}', encodeURIComponent(Auth[id]));
      }
    } else {
      this.vncPassword = ''
    }

    return (
      <div
        id="remote-desktop"
        data-test="remoteDesktop"
        style={{width: '100%', height: '100%', display: 'flex', 'justify-content': 'center'}}
        ref={(ref) => { this.playerParent = ref; }}
      >
        {this.renderFullscreenButton()}
        <VncDisplay
          className={styles.remoteDesktop}
          width='100%'
          height='100%'
          background="transparent"
          url={remoteDesktopUrl}
          credentials={{password: this.vncPassword}}
          onConnect={this.onConnect}
          viewOnly={viewOnly}
          shared
          scaleViewport
          ref={(ref) => {
	      this.player = ref;
	  }}
        />}
      </div>
    );
  }
}

RemoteDesktop.propTypes = propTypes;

export default injectIntl(injectWbResizeEvent(RemoteDesktop));
