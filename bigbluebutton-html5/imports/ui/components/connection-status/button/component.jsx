import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import ConnectionStatusModalComponent from '/imports/ui/components/connection-status/modal/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import Icon from '/imports/ui/components/connection-status/icon/component';
import Styled from './styles';
import { isMobile } from '/imports/utils/deviceInfo';

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
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
    }
  }

  renderIcon(level = 'normal') {
    return (
      <Styled.IconWrapper>
        <Icon
          level={level}
          grayscale
        />
      </Styled.IconWrapper>
    );
  }

  setModalIsOpen = (isOpen) => this.setState({ isModalOpen: isOpen });

  renderModal(isModalOpen) {
    return (
      isModalOpen ?
        <ConnectionStatusModalComponent
          {...{
            isModalOpen,
            setModalIsOpen: this.setModalIsOpen,
          }}
        /> : null
    )
  }

  render() {
    const {
      intl,
      connected,
    } = this.props;
    const { isModalOpen } = this.state;


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
            onClick={() => { }}
            data-test="connectionStatusButton"
            isMobile={isMobile}
          />
          {this.renderModal(isModalOpen)}
        </Styled.ButtonWrapper>
      );
    }

    const {
      myCurrentStatus,
    } = this.props;

    let color;
    switch (myCurrentStatus) {
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

    return (
      <Styled.ButtonWrapper>
        <Button
          customIcon={this.renderIcon(myCurrentStatus)}
          label={intl.formatMessage(intlMessages.label)}
          hideLabel
          aria-label={intl.formatMessage(intlMessages.description)}
          size="sm"
          color={color}
          circle
          onClick={() => this.setState({ isModalOpen: true })}
          data-test="connectionStatusButton"
        />
        {this.renderModal(isModalOpen)}
      </Styled.ButtonWrapper>
    );
  }
}

export default injectIntl(ConnectionStatusButton);
