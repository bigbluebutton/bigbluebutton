import React, { PureComponent } from 'react';
import cx from 'classnames';
import { defineMessages, injectIntl, IntlShape } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import ConnectionStatusModalComponent from '/imports/ui/components/connection-status/modal/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import SettingsMenuContainer from '/imports/ui/components/settings/container';
import { SETTINGS_TABS } from '/imports/ui/components/settings/enums';
import Icon from '/imports/ui/components/connection-status/icon/component';
import Styled from './styles';
import { isMobile } from '/imports/utils/deviceInfo';
import { ModalRegistration, useModalRegistration } from '/imports/ui/core/singletons/modalController';
import { RegisterBarPriorityEntries } from '/imports/ui/core/hooks/useBarPriorityEntries';

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

interface ConnectionStatusButtonProps {
  intl: IntlShape;
  connected: boolean;
  myCurrentStatus: string;
}

type ModalControls = ReturnType<typeof useModalRegistration>;

class ConnectionStatusButton extends PureComponent<ConnectionStatusButtonProps> {
  // Assigned by the connection status ModalRegistration render prop, which runs before any click.
  private setModalIsOpen!: (value: boolean) => void;

  private adjustYourSettingsModalControls?: ModalControls;

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
              selectedTab={SETTINGS_TABS.DATA_SAVING}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...{
                onRequestClose: () => adjustYourSettingsModal.close(),
                priority: 'medium',
                setIsOpen: (value: boolean) => {
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
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...{
                isModalOpen: isOpen,
                setModalIsOpen: (value: boolean) => {
                  if (value) open();
                  else close();
                },
                setAdjustYourSettingsModalIsOpen: (value: boolean) => {
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

    const overflowEntries = (
      <RegisterBarPriorityEntries
        bar="navBar"
        id="connectionStatus"
        entries={[{
          key: 'connectionStatus',
          label: intl.formatMessage(intlMessages.label),
          icon: 'network',
          disabled: !connected,
          onClick: () => this.setModalIsOpen(true),
          dataTest: 'connectionStatusOption',
        }]}
      />
    );

    if (!connected) {
      return (
        <Styled.ButtonWrapper>
          <Button
            className="bbb-connection-status-button bbb-connection-status-button--offline"
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
          {overflowEntries}
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
          className={cx(
            'bbb-connection-status-button',
            `bbb-connection-status-button--${myCurrentStatus || 'normal'}`,
          )}
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
        {overflowEntries}
      </Styled.ButtonWrapper>
    );
  }
}

export default injectIntl(ConnectionStatusButton);
