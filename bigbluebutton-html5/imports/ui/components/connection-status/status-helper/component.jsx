import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useReactiveVar } from '@apollo/client';
import Styled from './styles';
import Icon from '/imports/ui/components/connection-status/icon/component';
import SettingsMenuContainer from '/imports/ui/components/settings/container';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { getWorstStatus } from '../service';

const intlMessages = defineMessages({
  label: {
    id: 'app.connection-status.label',
    description: 'Connection status label',
  },
  settings: {
    id: 'app.connection-status.settings',
    description: 'Connection settings label',
  },
});

class ConnectionStatusIcon extends PureComponent {
  constructor(props) {
    super(props);

    this.state = { isSettingsMenuModalOpen: false };

    this.setSettingsMenuModalIsOpen = this.setSettingsMenuModalIsOpen.bind(this);
  }
  // eslint-disable-next-line
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

  openAdjustSettings() {
    this.setSettingsMenuModalIsOpen(true);
  }

  setSettingsMenuModalIsOpen(value) {
    const { closeModal } = this.props;

    this.setState({ isSettingsMenuModalOpen: value });
    if (!value) {
      closeModal();
    }
  }

  render() {
    const {
      intl,
      currentStatus,
    } = this.props;

    let color;
    switch (currentStatus) {
      case 'warning':
        color = 'success';
        break;
      case 'danger':
        color = 'warning';
        break;
      case 'critical':
        color = 'danger';
        break;
      default:
        color = 'success';
    }

    const { isSettingsMenuModalOpen } = this.state;

    return (
      <>
        <Styled.StatusIconWrapper color={color}>
          {this.renderIcon(currentStatus)}
        </Styled.StatusIconWrapper>
        <Styled.Label>
          {intl.formatMessage(intlMessages.label)}
        </Styled.Label>
        {(currentStatus === 'critical' || currentStatus === 'danger') || isSettingsMenuModalOpen
          ? (
            <div>
              <Styled.Settings
                // eslint-disable-next-line
                onClick={this.openAdjustSettings.bind(this)}
                role="button"
              >
                {intl.formatMessage(intlMessages.settings)}
              </Styled.Settings>
              {isSettingsMenuModalOpen
                ? (
                  <SettingsMenuContainer
                    selectedTab={2}
                    {...{
                      onRequestClose: () => this.setSettingsMenuModalIsOpen(false),
                      priority: 'medium',
                      setIsOpen: this.setSettingsMenuModalIsOpen,
                      isOpen: isSettingsMenuModalOpen,
                    }}
                  />
                ) : null}
            </div>
          )
          : (
            <div>&nbsp;</div>
          )}
      </>
    );
  }
}

const WrapConnectionStatus = (props) => {
  const rttStatus = useReactiveVar(connectionStatus.getRttStatusVar());
  const packetLossStatus = useReactiveVar(connectionStatus.getPacketLossStatusVar());
  const liveKitConnQuality = useReactiveVar(connectionStatus.getLiveKitConnectionStatusVar());
  const status = getWorstStatus([
    rttStatus,
    packetLossStatus,
    liveKitConnQuality,
  ]);

  return (
    <ConnectionStatusIcon
      {...props}
      currentStatus={status}
    />
  );
};

export default injectIntl(WrapConnectionStatus);
