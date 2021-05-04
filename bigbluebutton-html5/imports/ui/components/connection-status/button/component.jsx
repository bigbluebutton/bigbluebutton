import React, { PureComponent } from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import ConnectionStatusModalContainer from '/imports/ui/components/connection-status/modal/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import Icon from '/imports/ui/components/connection-status/icon/component';
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

class ConnectionStatusButton extends PureComponent {
  renderIcon(level = 'normal') {
    return(
      <div className={styles.iconWrapper}>
        <Icon
          level={level}
          grayscale
        />
      </div>
    );
  }

  render() {
    const {
      intl,
      connected,
    } = this.props;

    if (!connected) {
      return (
        <div className={styles.buttonWrapper}>
          <Button
            customIcon={this.renderIcon()}
            label={intl.formatMessage(intlMessages.label)}
            hideLabel
            aria-label={intl.formatMessage(intlMessages.description)}
            size="sm"
            disabled
            ghost
            circle
            onClick={() => {}}
            data-test="connectionStatusButton"
          />
        </div>
      );
    }

    const {
      stats,
      mountModal,
    } = this.props;

    let color;
    switch (stats) {
      case 'warning':
        color = 'success';
        break;
      case 'danger':
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

    const level = stats ? stats : 'normal';

    return (
      <div className={styles.buttonWrapper}>
        <Button
          customIcon={this.renderIcon(level)}
          label={intl.formatMessage(intlMessages.label)}
          hideLabel
          aria-label={intl.formatMessage(intlMessages.description)}
          size="sm"
          color={color}
          circle
          onClick={() => mountModal(<ConnectionStatusModalContainer />)}
          data-test="connectionStatusButton"
        />
      </div>
    );
  }
}

export default injectIntl(withModalMounter(ConnectionStatusButton));
