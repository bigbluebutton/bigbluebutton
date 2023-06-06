import React, { Fragment, PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import Icon from '/imports/ui/components/connection-status/icon/component';
import SettingsMenuContainer from '/imports/ui/components/settings/container';

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

  openAdjustSettings() {
    this.setSettingsMenuModalIsOpen(true);
  }

  setSettingsMenuModalIsOpen(value) {
    const {closeModal} = this.props;
    
    this.setState({isSettingsMenuModalOpen: value})
    if (!value) {
      closeModal();
    }
  }

  render() {
    const {
      intl,
      stats,
    } = this.props;
  
    let color;
    switch (stats) {
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

    const level = stats ? stats : 'normal';

    const { isSettingsMenuModalOpen } = this.state;

    return (
      <Fragment>
        <Styled.StatusIconWrapper color={color}>
          {this.renderIcon(level)}
        </Styled.StatusIconWrapper>
        <Styled.Label>
          {intl.formatMessage(intlMessages.label)}
        </Styled.Label>
        {(level === 'critical' || level === 'danger') || isSettingsMenuModalOpen
          ? (
            <div>
              <Styled.Settings
                onClick={this.openAdjustSettings.bind(this)}
                role="button"
              >
                {intl.formatMessage(intlMessages.settings)}
              </Styled.Settings>
              {isSettingsMenuModalOpen ? <SettingsMenuContainer
                selectedTab={2} 
                {...{
                  onRequestClose: () => this.setSettingsMenuModalIsOpen(false),
                  priority: "medium",
                  setIsOpen: this.setSettingsMenuModalIsOpen,
                  isOpen: isSettingsMenuModalOpen,
                }}
              /> : null}
            </div>
          )
          : (
            <div>&nbsp;</div>
          )
        }
      </Fragment>
    );
  }
}

export default injectIntl(ConnectionStatusIcon);
