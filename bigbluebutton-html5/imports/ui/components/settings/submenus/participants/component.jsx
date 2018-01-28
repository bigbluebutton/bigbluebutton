import React from 'react';
import Toggle from '/imports/ui/components/switch/component';
import Checkbox from '/imports/ui/components/checkbox/component';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import BaseMenu from '../base/component';
import { styles } from '../styles';

const intlMessages = defineMessages({
  participantsTitle: {
    id: 'app.userList.participantsTitle',
    description: 'heading label for participants submenu',
  },
  muteAllLabel: {
    id: 'app.submenu.participants.muteAllLabel',
    description: 'label for participants submenu mute section',
  },
  lockAllLabel: {
    id: 'app.submenu.participants.lockAllLabel',
    description: 'label for participants submenu lock section',
  },
  lockItemLabel: {
    id: 'app.submenu.participants.lockItemLabel',
    description: 'label for locking option',
  },
  lockCamDesc: {
    id: 'app.submenu.participants.lockCamDesc',
    description: 'lock webcam description',
  },
  lockMicDesc: {
    id: 'app.submenu.participants.lockMicDesc',
    description: 'lock Mic description',
  },
  lockPublicChatDesc: {
    id: 'app.submenu.participants.lockPublicChatDesc',
    description: 'lock public chat description',
  },
  lockPrivateChatDesc: {
    id: 'app.submenu.participants.lockPrivateChatDesc',
    description: 'lock private chat description',
  },
  lockLayoutDesc: {
    id: 'app.submenu.participants.lockLayoutDesc',
    description: 'lock layout description',
  },
  lockMicAriaLabel: {
    id: 'app.submenu.participants.lockMicAriaLabel',
    description: 'lock mic aria lable ',
  },
  lockCamAriaLabel: {
    id: 'app.submenu.participants.lockCamAriaLabel',
    description: 'lock webcam aria label',
  },
  lockPublicChatAriaLabel: {
    id: 'app.submenu.participants.lockPublicChatAriaLabel',
    description: 'lock public chat aria label',
  },
  lockPrivateChatAriaLabel: {
    id: 'app.submenu.participants.lockPrivateChatAriaLabel',
    description: 'lock private chat aria label',
  },
  lockLayoutAriaLabel: {
    id: 'app.submenu.participants.lockLayoutAriaLabel',
    description: 'lock layout aria label',
  },
  lockMicLabel: {
    id: 'app.submenu.participants.lockMicLabel',
    description: 'lock mic visible label',
  },
  lockCamLabel: {
    id: 'app.submenu.participants.lockCamLabel',
    description: 'lock webcam visible label',
  },
  lockPublicChatLabel: {
    id: 'app.submenu.participants.lockPublicChatLabel',
    description: 'lock public chat visible label',
  },
  lockPrivateChatLabel: {
    id: 'app.submenu.participants.lockPrivateChatLabel',
    description: 'lock private chat visible label',
  },
  lockLayoutLabel: {
    id: 'app.submenu.participants.lockLayoutLabel',
    description: 'lock layout visible lable',
  },
});

class ApplicationMenu extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings,
    };

    this.handleUpdateSettings = props.handleUpdateSettings;
  }

  getLockItems() {
    const { intl } = this.props;

    return [
      {
        key: 'webcam',
        label: intl.formatMessage(intlMessages.lockCamLabel),
        ariaLabelledBy: 'webcamLabel',
        ariaDescribedBy: 'webcamDesc',
        ariaLabel: intl.formatMessage(intlMessages.lockCamAriaLabel),
        ariaDesc: intl.formatMessage(intlMessages.lockCamDesc),
      },
      {
        key: 'microphone',
        label: intl.formatMessage(intlMessages.lockMicLabel),
        ariaLabelledBy: 'micLabel',
        ariaDescribedBy: 'micDesc',
        ariaLabel: intl.formatMessage(intlMessages.lockMicAriaLabel),
        ariaDesc: intl.formatMessage(intlMessages.lockMicDesc),
      },
      {
        key: 'publicChat',
        ariaLabelledBy: 'pubChatLabel',
        ariaDescribedBy: 'pubChatDesc',
        ariaLabel: intl.formatMessage(intlMessages.lockPublicChatAriaLabel),
        ariaDesc: intl.formatMessage(intlMessages.lockPublicChatDesc),
        label: intl.formatMessage(intlMessages.lockPublicChatLabel),
      },
      {
        key: 'privateChat',
        label: intl.formatMessage(intlMessages.lockPrivateChatLabel),
        ariaLabelledBy: 'privChatLabel',
        ariaDescribedBy: 'privChatDesc',
        ariaLabel: intl.formatMessage(intlMessages.lockPrivateChatAriaLabel),
        ariaDesc: intl.formatMessage(intlMessages.lockPrivateChatDesc),
      },
      {
        key: 'layout',
        ariaLabelledBy: 'layoutLabel',
        ariaDescribedBy: 'layoutDesc',
        ariaLabel: intl.formatMessage(intlMessages.lockLayoutAriaLabel),
        ariaDesc: intl.formatMessage(intlMessages.lockLayoutDesc),
        label: intl.formatMessage(intlMessages.lockLayoutLabel),
      },
    ];
  }

  render() {
    const { intl } = this.props;

    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.participantsTitle)}</h3>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <div className={styles.label}>
                  {intl.formatMessage(intlMessages.muteAllLabel)}
                </div>
              </div>
            </div>
            <div className={styles.col}>
              <div
                className={cx(styles.formElement, styles.pullContentRight)}
              >
                <Toggle
                  icons={false}
                  defaultChecked={this.state.settings.muteAll}
                  onChange={() => this.handleToggle('muteAll')}
                  ariaLabelledBy={'muteLabel'}
                  ariaLabel={intl.formatMessage(intlMessages.muteAllLabel)}
                />
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <div className={styles.label}>
                  {intl.formatMessage(intlMessages.lockAllLabel)}
                </div>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
                <Toggle
                  icons={false}
                  defaultChecked={this.state.settings.lockAll}
                  onChange={() => this.handleToggle('lockAll')}
                  ariaLabelledBy={'lockLabel'}
                  ariaLabel={intl.formatMessage(intlMessages.lockAllLabel)}
                />
              </div>
            </div>
          </div>
          {this.getLockItems().map((item, i) => this.renderLockItem(item, i))}
        </div>
      </div>
    );
  }

  renderLockItem({ label, key, ariaLabel, ariaLabelledBy, ariaDesc, ariaDescribedBy }, i) {
    const formControlId = _.uniqueId('from-key-');
    return (
      <div key={i} className={cx(styles.row, styles.spacedLeft)}>
        <div className={styles.col}>
          <div className={styles.formElement}>
            <label htmlFor={formControlId} className={styles.label}>
              {label}
            </label>
          </div>
        </div>
        <div className={styles.col}>
          <div
            className={cx(styles.formElement, styles.pullContentRight)}
          >
            <Checkbox
              onChange={() => this.handleToggle(key)}
              checked={this.state.settings[key]}
              ariaLabel={ariaLabel}
              ariaLabelledBy={ariaLabelledBy}
              ariaDesc={ariaDesc}
              ariaDescribedBy={ariaDescribedBy}
              id={formControlId}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(ApplicationMenu);
