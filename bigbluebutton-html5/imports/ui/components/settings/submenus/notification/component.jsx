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
    const { intl } = this.props;
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
                  <Toggle
                    icons={false}
                    defaultChecked={settings.chatAudioAlerts}
                    onChange={() => this.handleToggle('chatAudioAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                  />
                </div>
              </div>
              <div className={styles.col}>
                <div className={cx(styles.formElement, styles.pullContentCenter)}>
                  <Toggle
                    icons={false}
                    defaultChecked={settings.chatPushAlerts}
                    onChange={() => this.handleToggle('chatPushAlerts')}
                    ariaLabel={`${intl.formatMessage(intlMessages.messagesLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
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
                <Toggle
                  icons={false}
                  defaultChecked={settings.userJoinAudioAlerts}
                  onChange={() => this.handleToggle('userJoinAudioAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                />
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                <Toggle
                  icons={false}
                  defaultChecked={settings.userJoinPushAlerts}
                  onChange={() => this.handleToggle('userJoinPushAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.userJoinLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>
                {intl.formatMessage(intlMessages.raiseHandLabel)}
              </label>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                <Toggle
                  icons={false}
                  defaultChecked={settings.raiseHandAudioAlerts}
                  onChange={() => this.handleToggle('raiseHandAudioAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.audioAlertLabel)}`}
                />
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                <Toggle
                  icons={false}
                  defaultChecked={settings.raiseHandPushAlerts}
                  onChange={() => this.handleToggle('raiseHandPushAlerts')}
                  ariaLabel={`${intl.formatMessage(intlMessages.raiseHandLabel)} ${intl.formatMessage(intlMessages.pushAlertLabel)}`}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default injectIntl(NotificationMenu);
