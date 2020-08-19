import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import VncDisplay from 'react-vnc-display';

const propTypes = {
  remoteDesktopUrl: PropTypes.string.isRequired,
};

function passwordFunc(rfb) {
    rfb.sendPassword("Elgin2857");
}

// eslint-disable-next-line react/prefer-stateless-function
class RemoteDesktop extends Component {

  render() {
    const { remoteDesktopUrl } = this.props;

    return (
      <div
        id="video-player"
        data-test="videoPlayer"
      >
        <VncDisplay
          url={remoteDesktopUrl}
          forceAuthScheme={2}
          onPasswordRequired={passwordFunc}
          resize="scale"
          shared
        />
      </div>
    );
  }
}

RemoteDesktop.propTypes = propTypes;

export default injectIntl(RemoteDesktop);
