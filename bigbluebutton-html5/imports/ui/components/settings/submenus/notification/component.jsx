import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
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
});

class NotificationMenu extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'notification',
      settings: props.settings,
    };
  }

  render() {
    const {
      intl,
      isModerator,
      showGuestNotification,
      displaySettingsStatus,
      isChatEnabled,
    } = this.props;

    const { settings } = this.state;

    return (
      <div>
        <div>
          <Styled.Title>
            {intl.formatMessage(intlMessages.notificationSectionTitle)}
          </Styled.Title>
          <Styled.SubTitle>
            {intl.formatMessage(intlMessages.notificationSectionDesc)}
          </Styled.SubTitle>
        </div>

        <Styled.Form>
          <Styled.Row aria-hidden>
            <Styled.Col />
            <Styled.ColHeading>
              {intl.formatMessage(intlMessages.audioAlertLabel)}
            </Styled.ColHeading>
            <Styled.ColHeading>
              {intl.formatMessage(intlMessages.pushAlertLabel)}
            </Styled.ColHeading>
          </Styled.Row>

          {isChatEnabled ? (
            <Styled.Row>
              <Styled.Col>
                <Styled.Label aria-hidden>
                  {intl.formatMessage(intlMessages.messagesLabel)}
                </Styled.Label>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementRight>
                  {displaySettingsStatus(settings.chatAudioAlerts)}
                  <SubMenusStyle.MaterialSwitch
                    checked={settings.chatAudioAlerts}
                    onChange={() => this.handleToggle('chatAudioAlerts')}
                    inputProps={{
                      'aria-label': `${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.chatAudioAlerts, true)}`,
                    }}
                  />
                </Styled.FormElementRight>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementRight>
                  {displaySettingsStatus(settings.chatPushAlerts)}
                  <SubMenusStyle.MaterialSwitch
                    checked={settings.chatPushAlerts}
                    onChange={() => this.handleToggle('chatPushAlerts')}
                    inputProps={{
                      'aria-label': `${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.chatPushAlerts, true)}`,
                      'data-test': 'chatPopupAlertsBtn',
                    }}
                  />
                </Styled.FormElementRight>
              </Styled.Col>
            </Styled.Row>
          ) : null}

          <Styled.Row>
            <Styled.Col>
              <Styled.Label aria-hidden>
                {intl.formatMessage(intlMessages.userJoinLabel)}
              </Styled.Label>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                {displaySettingsStatus(settings.userJoinAudioAlerts)}
                <SubMenusStyle.MaterialSwitch
                  checked={settings.userJoinAudioAlerts}
                  onChange={() => this.handleToggle('userJoinAudioAlerts')}
                  inputProps={{
                    'aria-label': `${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.userJoinAudioAlerts, true)}`,
                  }}
                />
              </Styled.FormElementRight>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                {displaySettingsStatus(settings.userJoinPushAlerts)}
                <SubMenusStyle.MaterialSwitch
                  checked={settings.userJoinPushAlerts}
                  onChange={() => this.handleToggle('userJoinPushAlerts')}
                  inputProps={{
                    'aria-label': `${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.userJoinPushAlerts, true)}`,
                    'data-test': 'userJoinPopupAlerts',
                  }}
                />
              </Styled.FormElementRight>
            </Styled.Col>
          </Styled.Row>

          <Styled.Row>
            <Styled.Col>
              <Styled.Label aria-hidden>
                {intl.formatMessage(intlMessages.userLeaveLabel)}
              </Styled.Label>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                {displaySettingsStatus(settings.userLeaveAudioAlerts)}
                <SubMenusStyle.MaterialSwitch
                  checked={settings.userLeaveAudioAlerts}
                  onChange={() => this.handleToggle('userLeaveAudioAlerts')}
                  inputProps={{
                    'aria-label': `${intl.formatMessage(intlMessages.userLeaveLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.userLeaveAudioAlerts, true)}`,
                  }}
                />
              </Styled.FormElementRight>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                {displaySettingsStatus(settings.userLeavePushAlerts)}
                <SubMenusStyle.MaterialSwitch
                  checked={settings.userLeavePushAlerts}
                  onChange={() => this.handleToggle('userLeavePushAlerts')}
                  inputProps={{
                    'aria-label': `${intl.formatMessage(intlMessages.userLeaveLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.userLeavePushAlerts, true)}`,
                  }}
                />
              </Styled.FormElementRight>
            </Styled.Col>
          </Styled.Row>

          {isModerator && showGuestNotification ? (
            <Styled.Row>
              <Styled.Col>
                <Styled.Label aria-hidden>
                  {intl.formatMessage(intlMessages.guestWaitingLabel)}
                </Styled.Label>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementRight>
                  {displaySettingsStatus(settings.guestWaitingAudioAlerts)}
                  <SubMenusStyle.MaterialSwitch
                    checked={settings.guestWaitingAudioAlerts}
                    onChange={() => this.handleToggle('guestWaitingAudioAlerts')}
                    inputProps={{
                      'aria-label': `${intl.formatMessage(intlMessages.guestWaitingLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.guestWaitingAudioAlerts, true)}`,
                    }}
                  />
                </Styled.FormElementRight>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementRight>
                  {displaySettingsStatus(settings.guestWaitingPushAlerts)}
                  <SubMenusStyle.MaterialSwitch
                    checked={settings.guestWaitingPushAlerts}
                    onChange={() => this.handleToggle('guestWaitingPushAlerts')}
                    inputProps={{
                      'aria-label': `${intl.formatMessage(intlMessages.guestWaitingLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.guestWaitingPushAlerts, true)}`,
                    }}
                  />
                </Styled.FormElementRight>
              </Styled.Col>
            </Styled.Row>
          ) : null}

          {isModerator ? (
            <Styled.Row>
              <Styled.Col>
                <Styled.Label aria-hidden>
                  {intl.formatMessage(intlMessages.raiseHandLabel)}
                </Styled.Label>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementRight>
                  {displaySettingsStatus(settings.raiseHandAudioAlerts)}
                  <SubMenusStyle.MaterialSwitch
                    checked={settings.raiseHandAudioAlerts}
                    onChange={() => this.handleToggle('raiseHandAudioAlerts')}
                    inputProps={{
                      'aria-label': `${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.raiseHandAudioAlerts, true)}`,
                    }}
                  />
                </Styled.FormElementRight>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementRight>
                  {displaySettingsStatus(settings.raiseHandPushAlerts)}
                  <SubMenusStyle.MaterialSwitch
                    checked={settings.raiseHandPushAlerts}
                    onChange={() => this.handleToggle('raiseHandPushAlerts')}
                    inputProps={{
                      'aria-label': `${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.raiseHandPushAlerts, true)}`,
                    }}
                  />
                </Styled.FormElementRight>
              </Styled.Col>
            </Styled.Row>
          ) : null}

        </Styled.Form>
      </div>
    );
  }
}

export default injectIntl(NotificationMenu);
