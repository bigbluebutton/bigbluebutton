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
    };

    this.player = null;
    this.handleResize = this.handleResize.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
    this.resizeListener = () => {
      setTimeout(this.handleResize, 0);
    };
  }

  componentDidMount() {
    window.addEventListener('layoutSizesSets', this.resizeListener);
    this.playerParent.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  componentWillUnmount() {
    window.removeEventListener('layoutSizesSets', this.resizeListener);
    this.playerParent.removeEventListener('fullscreenchange', this.onFullscreenChange);
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

    const { isFullscreen } = this.state;
    var par;
    if (isFullscreen) {
	par = this.playerParent;
    } else {
        par = this.playerParent.parentElement;
    }
    const w = par.clientWidth;
    const h = par.clientHeight;

    const fb_width = this.player.rfb._fb_width;
    const fb_height = this.player.rfb._fb_height;

    if ((fb_width == 0) || (fb_height == 0)) {
	return;
    }

    const idealW = h * fb_width / fb_height;

    const style = {};
    if (idealW > w) {
      style.width = w;
      style.height = Math.floor(w * fb_height / fb_width);
    } else {
      style.width = Math.floor(idealW);
      style.height = h;
    }

    // some violation of component isolation here
    //
    // this.player is a VncDisplay, and we dig down into its internals
    // to resize the component.  This is necessary because not only
    // do we want to resize the drawing canvas, but the scaling factor
    // for translating mouse events also needs to be recomputed,
    // and VncDisplay doesn't currently export a method to do that.

    this.player.rfb._display.autoscale(style.width, style.height);

    const styleStr = `width: ${style.width}px; height: ${style.height}px; display: flex; justify-content: center;`;
    this.playerParent.style = styleStr;
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(this.playerParent);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
    }
    setTimeout(this.handleResize, 0);
  }

  passwordFunc = (rfb) => {
    rfb.sendPassword(this.vncPassword);
  }

  updateState = (rfb, newState, oldState, msg) => {
      /* We have to handshake a bit with the VNC server before
       * we know the remote screen geometry.  Therefore, once
       * the connection state transitions to 'normal', we
       * should schedule a resize.
       */
      if (newState == 'normal') {
	  setTimeout(this.handleResize, 0);
	  // should do this when VncDisplay is created, but it doesn't accept a suitable property
	  rfb._view_only = START_VIEWONLY;
      }
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
    var { remoteDesktopUrl } = this.props;

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
        ref={(ref) => { this.playerParent = ref; }}
      >
        {this.renderFullscreenButton()}
        <VncDisplay
          className={styles.remoteDesktop}
          url={remoteDesktopUrl}
          forceAuthScheme={1}
          onPasswordRequired={this.passwordFunc}
          onUpdateState={this.updateState}
          resize="scale"
          shared
          ref={(ref) => {
	      this.player = ref;
	      /* window.VncDisplay is globally accessible so that the lock button can access it */
	      window.VncDisplay = ref;
	  }}
        />}
      </div>
    );
  }
}

RemoteDesktop.propTypes = propTypes;

export default injectIntl(injectWbResizeEvent(RemoteDesktop));
