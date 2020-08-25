import React, { Component } from 'react';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import VncDisplay from 'react-vnc-display';
import Auth from '/imports/ui/services/auth';

import { styles } from './styles';

const propTypes = {
  remoteDesktopUrl: PropTypes.string,
};

class RemoteDesktop extends Component {

  constructor(props) {
    super(props);

    this.player = null;
    this.handleResize = this.handleResize.bind(this);
    this.resizeListener = () => {
      setTimeout(this.handleResize, 0);
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }

  handleResize() {
    if (!this.player || !this.playerParent) {
      return;
    }

    const par = this.playerParent.parentElement;
    const w = par.clientWidth;
    const h = par.clientHeight;
    const idealW = h * 1024 / 768;

    const style = {};
    if (idealW > w) {
      style.width = w;
      style.height = w * 768 / 1024;
    } else {
      style.width = idealW;
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

    const styleStr = `width: ${style.width}px; height: ${style.height}px;`;
    this.playerParent.style = styleStr;
  }

  passwordFunc = (rfb) => {
    rfb.sendPassword(this.vncPassword);
  }

  render() {
    var { remoteDesktopUrl } = this.props;

    if (remoteDesktopUrl) {
      const url = new URL(remoteDesktopUrl);
      this.vncPassword = url.searchParams.get('password');

      remoteDesktopUrl = remoteDesktopUrl.replace('{userID}', Auth.userID);
    } else {
      this.vncPassword = ''
    }

    return (
      <div
        id="remote-desktop"
        data-test="remoteDesktop"
        ref={(ref) => { this.playerParent = ref; }}
      >
        <VncDisplay
          className={styles.remoteDesktop}
          url={remoteDesktopUrl}
          forceAuthScheme={2}
          onPasswordRequired={this.passwordFunc}
          resize="scale"
          shared
          ref={(ref) => { this.player = ref; }}
        />
      </div>
    );
  }
}

RemoteDesktop.propTypes = propTypes;

export default injectIntl(injectWbResizeEvent(RemoteDesktop));
