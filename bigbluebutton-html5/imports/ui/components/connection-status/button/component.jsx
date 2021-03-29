import React, { Component } from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import ConnectionStatusModalContainer from '/imports/ui/components/connection-status/modal/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import { styles } from './styles';

const intlMessages = defineMessages({
  label: {
    id: 'app.connection-status.label',
    description: 'Connection status button label',
  },
  description: {
    id: 'app.connection-status.description',
    description: 'Connection status button description',
  },
});

class ConnectionStatusButton extends Component {
  shouldComponentUpdate(nextProps) {
    const {
      connected,
      stats,
    } = this.props;

    const {
      connected: nextConnected,
      stats: nextStats,
    } = nextProps;

    // Always re-render when the connection state change
    if (connected !== nextConnected) return true;

    // Avoid simple re-render case
    if (stats === nextStats) return false;

    // Avoid updating when component drifts between danger and critical
    // since it's the same feedback
    if (stats === 'danger' && nextStats === 'critical') return false;
    if (stats === 'critical' && nextStats === 'danger') return false;

    return true;
  }

  render() {
    const {
      intl,
      connected,
      stats,
      mountModal,
    } = this.props;

    let color;
    if (!connected) {
      color = 'offline';
    } else {
      switch (stats) {
        case 'warning':
        case 'danger':
          // We map warning and danger stats into the warning palette color and
          // the error notification
          color = 'warning';
          ConnectionStatusService.notification('warning', intl);
          break;
        case 'critical':
          color = 'danger';
          ConnectionStatusService.notification('error', intl);
          break;
        default:
          color = 'success';
      }
    }

    return (
      <Button
        icon="network"
        label={intl.formatMessage(intlMessages.label)}
        hideLabel
        aria-label={intl.formatMessage(intlMessages.description)}
        size="sm"
        color={color}
        disabled={!connected}
        circle
        onClick={() => mountModal(<ConnectionStatusModalContainer />)}
        data-test="connectionStatusButton"
      />
    );
  }
}

export default injectIntl(withModalMounter(ConnectionStatusButton));
