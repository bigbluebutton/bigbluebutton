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

    /* If the remote desktop URL includes the string "{jwt}", delay
     * opening the connection until we've obtained a JSON Web Token
     * and inserted it into the URL.
     */
    if (remoteDesktopUrl && remoteDesktopUrl.includes('{jwt}')) {
      remoteDesktopUrl = '';
    }

    this.state = {
      isFullscreen: false,
      resized: false,
      remoteDesktopUrl: remoteDesktopUrl,
      viewOnly: START_VIEWONLY,
    };

    /* window.remoteDesktop is globally accessible so that the lock button can access it */
    window.remoteDesktop = this;
  }

  async componentDidMount() {
    window.addEventListener('layoutSizesSets', this.handleResize);
    this.playerParent.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  componentWillUnmount() {
    window.removeEventListener('layoutSizesSets', this.handleResize);
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

    // There's currently a "FIXME: Use ResizeObserver" comment in the noVNC code.
    // Until noVNC can listen for resize events, this is how we tell it its geometry has changed.
    // Once that's fixed, there should be no need for a componentDidUpdate function at all.
    this.player.rfb._windowResize();
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
    var { remoteDesktopPassword, remoteDesktopCanOperate } = this.props;

    return (
      <div
        id="remote-desktop"
        data-test="remoteDesktop"
        style={{width: '100%', height: '100%', display: 'flex'}}
        ref={(ref) => { this.playerParent = ref; }}
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
