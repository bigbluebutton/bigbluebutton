import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import ConnectionStatusModalComponent from '/imports/ui/components/connection-status/modal/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import SettingsMenuContainer from '/imports/ui/components/settings/container';
import Icon from '/imports/ui/components/connection-status/icon/component';
import Styled from './styles';
import { isMobile } from '/imports/utils/deviceInfo';
import { ModalRegistration } from '/imports/ui/core/singletons/modalController';

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

const DATA_SAVINGS_TAB_NUMBER = 2;

class ConnectionStatusButton extends PureComponent {
  static renderIcon(level = 'normal') {
    return (
      <Styled.IconWrapper>
        <Icon
          level={level}
          grayscale
        />
      </Styled.IconWrapper>
    );
  }

  renderAjustYourSettingsModal() {
    return (
      <ModalRegistration id="adjustYourSettingsModal" priority="medium">
        {(adjustYourSettingsModal) => {
          this.adjustYourSettingsModalControls = adjustYourSettingsModal;
          if (!adjustYourSettingsModal.isOpen) return null;
          return (
            <SettingsMenuContainer
              selectedTab={DATA_SAVINGS_TAB_NUMBER}
              {...{
                onRequestClose: () => adjustYourSettingsModal.close(),
                priority: 'medium',
                setIsOpen: (value) => {
                  if (value) adjustYourSettingsModal.open();
                  else adjustYourSettingsModal.close();
                },
                isOpen: true,
              }}
            />
          );
        }}
      </ModalRegistration>
    );
  }

  render() {
    const {
      intl,
      connected,
    } = this.props;

    const ConnectionStatusModal = (
      <ModalRegistration id="connectionStatusModal" priority="low">
        {({
          isOpen, open, close,
        }) => {
          this.setModalIsOpen = (value) => {
            if (value) open();
            else close();
          };
          if (!isOpen) return null;
          return (
            <ConnectionStatusModalComponent
              {...{
                isModalOpen: isOpen,
                setModalIsOpen: (value) => {
                  if (value) open();
                  else close();
                },
                setAdjustYourSettingsModalIsOpen: (value) => {
                  if (this.adjustYourSettingsModalControls) {
                    if (value) this.adjustYourSettingsModalControls.open();
                    else this.adjustYourSettingsModalControls.close();
                  }
                },
              }}
            />
          );
        }}
      </ModalRegistration>
    );

    if (!connected) {
      return (
        <Styled.ButtonWrapper>
          <Button
            customIcon={ConnectionStatusButton.renderIcon()}
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
          {ConnectionStatusModal}
          {this.renderAjustYourSettingsModal()}
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
          customIcon={ConnectionStatusButton.renderIcon(myCurrentStatus)}
          label={intl.formatMessage(intlMessages.label)}
          hideLabel
          aria-label={intl.formatMessage(intlMessages.description)}
          size="sm"
          color={color}
          circle
          onClick={() => this.setModalIsOpen(true)}
          data-test="connectionStatusButton"
        />
        {ConnectionStatusModal}
        {this.renderAjustYourSettingsModal()}
      </Styled.ButtonWrapper>
    );
  }
}

export default injectIntl(ConnectionStatusButton);
