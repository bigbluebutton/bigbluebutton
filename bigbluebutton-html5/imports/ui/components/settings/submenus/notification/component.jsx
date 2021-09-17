import React from 'react';
import cx from 'classnames';
import Toggle from '/imports/ui/components/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import { styles } from '../styles';

const CHAT_ENABLED = Meteor.settings.public.chat.enabled;

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
          <h3 className={styles.title}>
            {intl.formatMessage(intlMessages.notificationSectionTitle)}
          </h3>
          <h4 className={styles.subtitle}>{intl.formatMessage(intlMessages.notificationSectionDesc)}</h4>
        </div>

        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col} />
            <div className={cx(styles.col, styles.colHeading)}>
              {intl.formatMessage(intlMessages.audioAlertLabel)}
            </div>
            <div className={cx(styles.col, styles.colHeading)}>
              {intl.formatMessage(intlMessages.pushAlertLabel)}
            </div>
          </div>

          {CHAT_ENABLED ? (
            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.messagesLabel)}
                </label>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentCenter)}>
                  {displaySettingsStatus(settings.chatAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.chatAudioAlerts}
                    onChange={() => this.handleToggle('chatAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentCenter)}>
                  {displaySettingsStatus(settings.chatPushAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.chatPushAlerts}
                    onChange={() => this.handleToggle('chatPushAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </div>
              </div>
            </div>) : null
            }

          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>
                {intl.formatMessage(intlMessages.userJoinLabel)}
              </label>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                {displaySettingsStatus(settings.userJoinAudioAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userJoinAudioAlerts}
                  onChange={() => this.handleToggle('userJoinAudioAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                  showToggleLabel={showToggleLabel}
                />
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                {displaySettingsStatus(settings.userJoinPushAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userJoinPushAlerts}
                  onChange={() => this.handleToggle('userJoinPushAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                  showToggleLabel={showToggleLabel}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>
                {intl.formatMessage(intlMessages.userLeaveLabel)}
              </label>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                {displaySettingsStatus(settings.userLeaveAudioAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userLeaveAudioAlerts}
                  onChange={() => this.handleToggle('userLeaveAudioAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userLeaveLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                  showToggleLabel={showToggleLabel}
                />
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                {displaySettingsStatus(settings.userLeavePushAlerts)}
                <Toggle
                  icons={false}
                  defaultChecked={settings.userLeavePushAlerts}
                  onChange={() => this.handleToggle('userLeavePushAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userLeaveLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                  showToggleLabel={showToggleLabel}
                />
              </div>
            </div>
          </div>

          {isModerator && showGuestNotification ? (
            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.guestWaitingLabel)}
                </label>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentCenter)}>
                  {displaySettingsStatus(settings.guestWaitingAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.guestWaitingAudioAlerts}
                    onChange={() => this.handleToggle('guestWaitingAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.guestWaitingLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentCenter)}>
                  {displaySettingsStatus(settings.guestWaitingPushAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.guestWaitingPushAlerts}
                    onChange={() => this.handleToggle('guestWaitingPushAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.guestWaitingLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {isModerator ? (
            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>
                  {intl.formatMessage(intlMessages.raiseHandLabel)}
                </label>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentCenter)}>
                  {displaySettingsStatus(settings.raiseHandAudioAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.raiseHandAudioAlerts}
                    onChange={() => this.handleToggle('raiseHandAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentCenter)}>
                  {displaySettingsStatus(settings.raiseHandPushAlerts)}
                  <Toggle
                    icons={false}
                    defaultChecked={settings.raiseHandPushAlerts}
                    onChange={() => this.handleToggle('raiseHandPushAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                    showToggleLabel={showToggleLabel}
                  />
                </div>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    );
  }
}

export default injectIntl(NotificationMenu);
