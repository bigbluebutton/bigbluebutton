import React, { Component } from 'react';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FullscreenService from '../fullscreen-button/service';
import FullscreenButtonContainer from '../fullscreen-button/container';
import DesktopCloseButton from './close-button/component';
import { defineMessages, injectIntl } from 'react-intl';
import VncDisplay from 'react-vnc-display';
import Auth from '/imports/ui/services/auth';
import { notify } from '/imports/ui/services/notification';
import MediaService from '../media/service';
import { ACTIONS } from '/imports/ui/components/layout/enums';

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

    var { remoteDesktopUrl, remoteDesktopCanOperate } = props;

    /* Append our sessionToken to the URL so that the WebSocket/VNC server
     * can authenticate the user.
     *
     * Implicit in this design is that the WebSocket/VNC server knows
     * which BigBlueButton server to authenticate against.
     *
     * We check for '?' to see if the user specified any URL parameters
     * which we append to, instead of adding a new parameters string.
     */

    if (remoteDesktopUrl) {
        if (remoteDesktopUrl.includes('?')) {
            remoteDesktopUrl = `${remoteDesktopUrl}&sessionToken=${Auth.sessionToken}`;
        } else {
            remoteDesktopUrl = `${remoteDesktopUrl}?sessionToken=${Auth.sessionToken}`;
        }
    }

    this.state = {
      isFullscreen: false,
      resized: false,
      remoteDesktopUrl: remoteDesktopUrl,
      viewOnly: START_VIEWONLY,
    };

    /* window.remoteDesktop is globally accessible so that the lock button can access it */
    window.remoteDesktop = this;

    /* window.allowClipboard is globally accessible so that the clipboard enable option can access it */

    /* Safari doesn't currently (Feb 2021) support navigator.permissions, so it's important that we
     * test to see if it exists before trying to use it.  If navigator.permissions isn't supported,
     * then the user has to click on "enable clipboard" even if the clipboard is already enabled.
     */
    if (navigator.permissions) {
      const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
      navigator.permissions.query(queryOpts).then(permissionStatus => {
        window.allowClipboard = (permissionStatus.state == 'granted');
      });
    }
  }

  transferClipboardText = (ev) => {
    if (window.allowClipboard) {
      navigator.clipboard.readText().then((text) => {
        if (text != this.clipboardText) {
          if (this.player && this.player.rfb) {
            this.player.rfb.clipboardPasteFrom(text);
          }
          this.clipboardText = text;
        }
      });
    }
  }

  componentDidMount() {
    const {
      getSwapLayout,
      toggleSwapLayout,
      layoutContextDispatch,
      hidePresentation,
    } = this.props;

    this.playerParent.addEventListener('fullscreenchange', this.onFullscreenChange);

    document.addEventListener('cut', this.transferClipboardText);
    document.addEventListener('copy', this.transferClipboardText);

    /* XXX this is what external video does, don't know why (bwb) */
    /* if (getSwapLayout()) toggleSwapLayout(layoutContextDispatch); */

    if (hidePresentation) {
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: true,
      });
    }

    layoutContextDispatch({
      type: ACTIONS.SET_HAS_REMOTE_DESKTOP,
      value: true,
    });
  }

  componentWillUnmount() {
    const { hidePresentation, layoutContextDispatch } = this.props;

    layoutContextDispatch({
      type: ACTIONS.SET_HAS_REMOTE_DESKTOP,
      value: false,
    });

    if (hidePresentation) {
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: false,
      });
    }
    document.removeEventListener('copy', this.transferClipboardText);
    document.removeEventListener('cut', this.transferClipboardText);
    this.playerParent.removeEventListener('fullscreenchange', this.onFullscreenChange);
    this.unmounting = true;
    delete window.remoteDesktop;
  }

  handleResize = () => {

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

    this.player.rfb._windowResize();
  }

  componentDidUpdate(prevProps) {
    const {
      presentationBounds,
    } = this.props;

    const {
      presentationBounds: prevPresentationBounds,
    } = prevProps;

    // There's currently a "FIXME: Use ResizeObserver" comment in the noVNC code.
    // Until noVNC can listen for resize events, this is how we tell it its geometry has changed.
    // Once that's fixed, there should be no need for a componentDidUpdate function at all.

    if (presentationBounds !== prevPresentationBounds) this.player.rfb._windowResize();
  }

  onFullscreenChange = () => {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(this.playerParent);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
    }
    this.handleResize();
  }

  onSecurityFailure = () => {
      notify('VNC security failure');
  }

  onCredentialsRequired = () => {
      notify('VNC authentication failure');
  }

  onDisconnect = () => {
      if (! this.unmounting) {
          notify('VNC disconnect');
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
    var { remoteDesktopUrl, viewOnly } = this.state;
    var { remoteDesktopPassword, remoteDesktopCanOperate, presentationBounds, fullscreenContext, layoutSwapped } = this.props;

    return (
      <div
        id="remote-desktop"
        data-test="remoteDesktop"
        className={styles.remoteDesktop}
        style={{
          top: presentationBounds.top,
          left: presentationBounds.left,
          right: presentationBounds.right,
          width: presentationBounds.width,
          height: presentationBounds.height,
          display: layoutSwapped ? 'none' : 'flex',
          zIndex: fullscreenContext ? presentationBounds.zIndex : undefined,
        }}
        ref={(ref) => { this.playerParent = ref; }}
        /* onMouseEnter/onFocus doesn't seem to work on VncDisplay
         *
         * onMouseEnter will sometimes cause transferClipboardText to throw an exception
         * because the document doesn't have focus, so let's use onFocus instead
         */
        onFocus={() => this.transferClipboardText('div.onFocus')}
      >
        <DesktopCloseButton toggleSwapLayout={MediaService.toggleSwapLayout}/>
        {this.renderFullscreenButton()}
        <VncDisplay
          className={styles.remoteDesktop}
          width='100%'
          height='100%'
          background="transparent"
          url={remoteDesktopUrl}
          credentials={{password: remoteDesktopPassword}}
	 /* We have to handshake a bit with the VNC server before
	  * we know the remote screen geometry.  Therefore, once
	  * we finish connecting, process a resize.
	  */
          onConnect={this.handleResize}
          onSecurityFailure={this.onSecurityFailure}
          onCredentialsRequired={this.onCredentialsRequired}
          onDisconnect={this.onDisconnect}
          onClipboard={(event) => window.allowClipboard && navigator.clipboard.writeText(event.detail.text)}
          viewOnly={!remoteDesktopCanOperate || viewOnly}
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
