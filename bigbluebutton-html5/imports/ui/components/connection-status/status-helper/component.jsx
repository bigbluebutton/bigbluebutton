import React, { Fragment, PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
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
    const {
      closeModal,
      mountModal,
    } = this.props;

    closeModal();
    mountModal(<SettingsMenuContainer selectedTab={2} />);
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

    return (
      <Fragment>
        <Styled.StatusIconWrapper color={color}>
          {this.renderIcon(level)}
        </Styled.StatusIconWrapper>
        <Styled.Label>
          {intl.formatMessage(intlMessages.label)}
        </Styled.Label>
        {(level === 'critical' || level === 'danger')
          ? (
            <div>
              <Styled.Settings
                onClick={this.openAdjustSettings.bind(this)}
                role="button"
              >
                {intl.formatMessage(intlMessages.settings)}
              </Styled.Settings>
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

export default withModalMounter(injectIntl(ConnectionStatusIcon));
