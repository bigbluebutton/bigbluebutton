import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import VncDisplay from 'react-vnc-display';

import { styles } from './styles';

const propTypes = {
  remoteDesktopUrl: PropTypes.string,
};

class RemoteDesktop extends Component {

  passwordFunc = (rfb) => {
    rfb.sendPassword(this.vncPassword);
  }

  render() {
    const { remoteDesktopUrl } = this.props;

    if (remoteDesktopUrl) {
      const url = new URL(remoteDesktopUrl);
      this.vncPassword = url.searchParams.get('password');
    } else {
      this.vncPassword = ''
    }

    return (
      <div id="remote-desktop" data-test="remoteDesktop">
        <VncDisplay
          className={styles.remoteDesktop}
          url={remoteDesktopUrl}
          forceAuthScheme={2}
          onPasswordRequired={this.passwordFunc}
          resize="scale"
          shared
        />
      </div>
    );
  }
}

RemoteDesktop.propTypes = propTypes;

export default injectIntl(RemoteDesktop);
