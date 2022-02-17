import React, { PureComponent } from 'react';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import ConnectionStatusModalContainer from '/imports/ui/components/connection-status/modal/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import Icon from '/imports/ui/components/connection-status/icon/component';
import Styled from './styles';

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
      <Styled.IconWrapper>
        <Icon
          level={level}
          grayscale
        />
      </Styled.IconWrapper>
    );
  }

  render() {
    const {
      intl,
      connected,
    } = this.props;

    if (!connected) {
      return (
        <Styled.ButtonWrapper>
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
        </Styled.ButtonWrapper>
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
      <Styled.ButtonWrapper>
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
      </Styled.ButtonWrapper>
    );
  }
}

export default injectIntl(withModalMounter(ConnectionStatusButton));
