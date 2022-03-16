import React from 'react';
import Toggle from '/imports/ui/components/common/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import Styled from './styles';
import { isChatEnabled } from '/imports/ui/services/features';

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
    description: 'push notifiation label',
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
      showToggleLabel,
      displaySettingsStatus,
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
          <Styled.Row>
            <Styled.Col />
            <Styled.ColHeading>
              {intl.formatMessage(intlMessages.audioAlertLabel)}
            </Styled.ColHeading>
            <Styled.ColHeading>
              {intl.formatMessage(intlMessages.pushAlertLabel)}
            </Styled.ColHeading>
          </Styled.Row>

          {isChatEnabled() ? (
            <Styled.Row>
              <Styled.Col>
                <Styled.Label>
                  {intl.formatMessage(intlMessages.messagesLabel)}
                </Styled.Label>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.chatAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.chatAudioAlerts}
                    onChange={() => this.handleToggle('chatAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </Styled.FormElementCenter>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.chatPushAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.chatPushAlerts}
                    onChange={() => this.handleToggle('chatPushAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                    data-test="chatPopupAlertsBtn"
                  />
                </Styled.FormElementCenter>
              </Styled.Col>
            </Styled.Row>
          ) : null}

          <Styled.Row>
            <Styled.Col>
              <Styled.Label>
                {intl.formatMessage(intlMessages.userJoinLabel)}
              </Styled.Label>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementCenter>
                {displaySettingsStatus(settings.userJoinAudioAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userJoinAudioAlerts}
                  onChange={() => this.handleToggle('userJoinAudioAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                  showToggleLabel={showToggleLabel}
                />
              </Styled.FormElementCenter>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementCenter>
                {displaySettingsStatus(settings.userJoinPushAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userJoinPushAlerts}
                  onChange={() => this.handleToggle('userJoinPushAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                  showToggleLabel={showToggleLabel}
                  data-test="userJoinPopupAlerts"
                />
              </Styled.FormElementCenter>
            </Styled.Col>
          </Styled.Row>

          <Styled.Row>
            <Styled.Col>
              <Styled.Label>
                {intl.formatMessage(intlMessages.userLeaveLabel)}
              </Styled.Label>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementCenter>
                {displaySettingsStatus(settings.userLeaveAudioAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userLeaveAudioAlerts}
                  onChange={() => this.handleToggle('userLeaveAudioAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userLeaveLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                  showToggleLabel={showToggleLabel}
                />
              </Styled.FormElementCenter>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementCenter>
                {displaySettingsStatus(settings.userLeavePushAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userLeavePushAlerts}
                  onChange={() => this.handleToggle('userLeavePushAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userLeaveLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                  showToggleLabel={showToggleLabel}
                />
              </Styled.FormElementCenter>
            </Styled.Col>
          </Styled.Row>

          {isModerator && showGuestNotification ? (
            <Styled.Row>
              <Styled.Col>
                <Styled.Label>
                  {intl.formatMessage(intlMessages.guestWaitingLabel)}
                </Styled.Label>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.guestWaitingAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.guestWaitingAudioAlerts}
                    onChange={() => this.handleToggle('guestWaitingAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.guestWaitingLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </Styled.FormElementCenter>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.guestWaitingPushAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.guestWaitingPushAlerts}
                    onChange={() => this.handleToggle('guestWaitingPushAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.guestWaitingLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </Styled.FormElementCenter>
              </Styled.Col>
            </Styled.Row>
          ) : null}

          {isModerator ? (
            <Styled.Row>
              <Styled.Col>
                <Styled.Label>
                  {intl.formatMessage(intlMessages.raiseHandLabel)}
                </Styled.Label>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.raiseHandAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.raiseHandAudioAlerts}
                    onChange={() => this.handleToggle('raiseHandAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </Styled.FormElementCenter>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.raiseHandPushAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.raiseHandPushAlerts}
                    onChange={() => this.handleToggle('raiseHandPushAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </Styled.FormElementCenter>
              </Styled.Col>
            </Styled.Row>
          ) : null}

        </Styled.Form>
      </div>
    );
  }
}

export default injectIntl(NotificationMenu);
