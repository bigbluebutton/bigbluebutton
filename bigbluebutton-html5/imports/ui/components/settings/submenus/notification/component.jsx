import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import AudioManager from '/imports/ui/services/audio-manager';
import { BBBToggle } from '@bigbluebutton/bbb-ui-components-react/Toggle';
import { BBBTypography } from '@bigbluebutton/bbb-ui-components-react/Typography';
import BaseMenu from '../base/component';
import SubMenusStyle from '../styles';
import Styled from './styles';

const intlMessages = defineMessages({
  notificationSectionTitle: {
    id: 'app.submenu.notification.SectionTitle',
    description: 'Notification section title',
  },
  notificationSectionDesc: {
    id: 'app.submenu.notification.Desc',
    description: 'provides extra info for notification section',
  },
  audioAlertLabel: {
    id: 'app.submenu.notification.audioAlertLabel',
    description: 'audio notification label',
  },
  pushAlertLabel: {
    id: 'app.submenu.notification.pushAlertLabel',
    description: 'push notification label',
  },
  messagesLabel: {
    id: 'app.submenu.notification.messagesLabel',
    description: 'label for chat messages',
  },
  userJoinLabel: {
    id: 'app.submenu.notification.userJoinLabel',
    description: 'label for chat messages',
  },
  userLeaveLabel: {
    id: 'app.submenu.notification.userLeaveLabel',
    description: 'label for user leave notifications',
  },
  guestWaitingLabel: {
    id: 'app.submenu.notification.guestWaitingLabel',
    description: 'label for guests waiting for approval',
  },
  raiseHandLabel: {
    id: 'app.submenu.notification.raiseHandLabel',
    description: 'label for raise hand emoji notifications',
  },
  muteUnmuteLabel: {
    id: 'app.submenu.notification.muteUnmuteLabel',
    description: 'label for mute/unmute audio notifications',
  },
});

class NotificationMenu extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'notification',
      settings: props.settings,
    };
  }

  renderAlertToggle(rowLabel, columnLabel, settingKey, dataTest, disabled = false) {
    const { intl, displaySettingsStatus } = this.props;
    const { settings } = this.state;
    const checked = !disabled && !!settings[settingKey];

    return (
      <Styled.ToggleCol>
        <BBBToggle
          checked={checked}
          disabled={disabled}
          onChange={() => this.handleToggle(settingKey)}
          helperText={displaySettingsStatus(checked)}
          textPosition="left"
          ariaLabel={`${intl.formatMessage(rowLabel)} ${intl.formatMessage(columnLabel)}`}
          slotProps={dataTest ? { input: { 'data-test': dataTest } } : undefined}
        />
      </Styled.ToggleCol>
    );
  }

  renderAlertRow(rowLabel, audioKey, pushKey, pushDataTest, pushDisabled = false) {
    const { intl } = this.props;

    return (
      <SubMenusStyle.Row>
        <SubMenusStyle.Col>
          <SubMenusStyle.Label aria-hidden>
            {intl.formatMessage(rowLabel)}
          </SubMenusStyle.Label>
        </SubMenusStyle.Col>
        {this.renderAlertToggle(rowLabel, intlMessages.audioAlertLabel, audioKey)}
        {this.renderAlertToggle(
          rowLabel,
          intlMessages.pushAlertLabel,
          pushKey,
          pushDataTest,
          pushDisabled,
        )}
      </SubMenusStyle.Row>
    );
  }

  render() {
    const {
      intl,
      isModerator,
      showGuestNotification,
      isChatEnabled,
    } = this.props;

    const isLiveKit = AudioManager.bridge?.bridgeName === 'livekit';

    return (
      <SubMenusStyle.Section>
        <SubMenusStyle.Group>
          <BBBTypography variant="selected" as="h3">
            {intl.formatMessage(intlMessages.notificationSectionTitle)}
          </BBBTypography>
          <BBBTypography as="h4">
            {intl.formatMessage(intlMessages.notificationSectionDesc)}
          </BBBTypography>
        </SubMenusStyle.Group>

        <SubMenusStyle.Group>
          <SubMenusStyle.Row aria-hidden>
            <SubMenusStyle.Col />
            <Styled.ToggleCol>
              <BBBTypography variant="selected" as="span">
                {intl.formatMessage(intlMessages.audioAlertLabel)}
              </BBBTypography>
            </Styled.ToggleCol>
            <Styled.ToggleCol>
              <BBBTypography variant="selected" as="span">
                {intl.formatMessage(intlMessages.pushAlertLabel)}
              </BBBTypography>
            </Styled.ToggleCol>
          </SubMenusStyle.Row>

          {isChatEnabled
            && this.renderAlertRow(intlMessages.messagesLabel, 'chatAudioAlerts', 'chatPushAlerts', 'chatPopupAlertsBtn')}
          {this.renderAlertRow(intlMessages.userJoinLabel, 'userJoinAudioAlerts', 'userJoinPushAlerts', 'userJoinPopupAlerts')}
          {this.renderAlertRow(intlMessages.userLeaveLabel, 'userLeaveAudioAlerts', 'userLeavePushAlerts', 'userLeavePopupAlerts')}
          {isLiveKit
            && this.renderAlertRow(intlMessages.muteUnmuteLabel, 'muteUnmuteAudioAlerts', null, null, true)}
          {isModerator && showGuestNotification
            && this.renderAlertRow(intlMessages.guestWaitingLabel, 'guestWaitingAudioAlerts', 'guestWaitingPushAlerts')}
          {isModerator
            && this.renderAlertRow(intlMessages.raiseHandLabel, 'raiseHandAudioAlerts', 'raiseHandPushAlerts')}
        </SubMenusStyle.Group>
      </SubMenusStyle.Section>
    );
  }
}

export default injectIntl(NotificationMenu);
