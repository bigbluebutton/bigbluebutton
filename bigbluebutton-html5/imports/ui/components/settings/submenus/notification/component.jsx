import React from 'react';
import Toggle from '/imports/ui/components/common/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import AudioManager from '/imports/ui/services/audio-manager';
import BaseMenu from '../base/component';
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

  render() {
    const {
      intl,
      isModerator,
      showGuestNotification,
      showToggleLabel,
      displaySettingsStatus,
      isChatEnabled,
    } = this.props;

    const { settings } = this.state;
    const isLiveKit = AudioManager.bridge?.bridgeName === 'livekit';

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
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.chatAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.chatAudioAlerts}
                    onChange={() => this.handleToggle('chatAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.chatAudioAlerts, true)}`}
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
                    ariaLabel={`${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.chatPushAlerts, true)}`}
                    showToggleLabel={showToggleLabel}
                    data-test="chatPopupAlertsBtn"
                  />
                </Styled.FormElementCenter>
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
              <Styled.FormElementCenter>
                {displaySettingsStatus(settings.userJoinAudioAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userJoinAudioAlerts}
                  onChange={() => this.handleToggle('userJoinAudioAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.userJoinAudioAlerts, true)}`}
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
                  ariaLabel={`${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.userJoinPushAlerts, true)}`}
                  showToggleLabel={showToggleLabel}
                  data-test="userJoinPopupAlerts"
                />
              </Styled.FormElementCenter>
            </Styled.Col>
          </Styled.Row>

          <Styled.Row>
            <Styled.Col>
              <Styled.Label aria-hidden>
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
                  ariaLabel={`${intl.formatMessage(intlMessages.userLeaveLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.userLeaveAudioAlerts, true)}`}
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
                  ariaLabel={`${intl.formatMessage(intlMessages.userLeaveLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.userLeavePushAlerts, true)}`}
                  showToggleLabel={showToggleLabel}
                />
              </Styled.FormElementCenter>
            </Styled.Col>
          </Styled.Row>
          {isLiveKit ? (
            <Styled.Row>
              <Styled.Col>
                <Styled.Label aria-hidden>
                  {intl.formatMessage(intlMessages.muteUnmuteLabel)}
                </Styled.Label>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.muteUnmuteAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.muteUnmuteAudioAlerts}
                    onChange={() => this.handleToggle('muteUnmuteAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.muteUnmuteLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.muteUnmuteAudioAlerts, true)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </Styled.FormElementCenter>
              </Styled.Col>
              <Styled.Col>
                <Styled.FormElementCenter>
                  {displaySettingsStatus(false)}
                  <Toggle
                    icons={false}
                    defaultChecked={false}
                    onChange={() => { }}
                    disabled
                    ariaLabel={`${intl.formatMessage(intlMessages.muteUnmuteLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </Styled.FormElementCenter>
              </Styled.Col>
            </Styled.Row>
          ) : null}

          {isModerator && showGuestNotification ? (
            <Styled.Row>
              <Styled.Col>
                <Styled.Label aria-hidden>
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
                    ariaLabel={`${intl.formatMessage(intlMessages.guestWaitingLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.guestWaitingAudioAlerts, true)}`}
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
                    ariaLabel={`${intl.formatMessage(intlMessages.guestWaitingLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.guestWaitingPushAlerts, true)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </Styled.FormElementCenter>
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
                <Styled.FormElementCenter>
                  {displaySettingsStatus(settings.raiseHandAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.raiseHandAudioAlerts}
                    onChange={() => this.handleToggle('raiseHandAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)} - ${displaySettingsStatus(settings.raiseHandAudioAlerts, true)}`}
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
                    ariaLabel={`${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)} - ${displaySettingsStatus(settings.raiseHandPushAlerts, true)}`}
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
