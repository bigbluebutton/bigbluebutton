import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import styles from '../../styles.scss';
import Service from './service';

const ROLE_MODERATOR = 'moderator';

const LOCK_OPTIONS = {
  MUTE_ALL: {
    label: 'Mute all except the presenter',
    ariaLabelledBy: 'muteALlLabel',
    ariaDescribedBy: 'muteAllDesc',
    ariaLabel: 'Mute all',
    ariaDesc: 'Mutes all participants except the presenter.',
    tabIndex: 7,
  },
  LOCK_ALL: {
    label: 'Lock all participants',
    ariaLabelledBy: 'lockAllLabel',
    ariaDescribedBy: 'lockAllDesc',
    ariaLabel: 'Lock all',
    ariaDesc: 'Toggles locked status for all participants.',
    tabIndex: 8,
  },
  WEBCAM_LOCK: {
    label: 'Webcam',
    ariaLabelledBy: 'webcamLabel',
    ariaDescribedBy: 'webcamDesc',
    ariaLabel: 'Webcam lock',
    ariaDesc: 'Disables the webcam for all locked participants.',
    tabIndex: 9,
  },
  MIC_LOCK: {
    label: 'Microphone',
    ariaLabelledBy: 'micLabel',
    ariaDescribedBy: 'micDesc',
    ariaLabel: 'Microphone lock',
    ariaDesc: 'Disables the microphone for all locked participants.',
    tabIndex: 10,
  },
  PUBLIC_CHAT_LOCK: {
    label: 'Public chat',
    ariaLabelledBy: 'pubChatLabel',
    ariaDescribedBy: 'pubChatDesc',
    ariaLabel: 'Public chat lock',
    ariaDesc: 'Disables public chat for all locked participants.',
    tabIndex: 11,
  },
  PRIVATE_CHAT_LOCK: {
    label: 'Private chat',
    ariaLabelledBy: 'privChatLabel',
    ariaDescribedBy: 'privChatDesc',
    ariaLabel: 'Private chat lock',
    ariaDesc: 'Disables private chat for all locked participants.',
    tabIndex: 12,
  },
};

export default class ParticipantsMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  renderLockItem(lockOption) {
    return (
      <div className={styles.row} role='presentation' key={lockOption.label} >
        <label>
          <input
            className={styles.checkboxOffset}
            type="checkbox"
            tabIndex={lockOption.tabIndex}
            aria-labelledby={lockOption.ariaLabelledBy}
            aria-describedby={lockOption.ariaDescribedBy} />
          {lockOption.label}
        </label>
        <div id={lockOption.ariaLabelledBy} hidden>{lockOption.ariaLabel}</div>
        <div id={lockOption.ariaDescribedBy} hidden>{lockOption.ariaDesc}</div>
      </div>
    );
  }

  renderLockOptions () {

    const { isPresenter, role } = this.props;

    let roleBasedOptions = [];

    if (isPresenter || role === ROLE_MODERATOR) {
      roleBasedOptions.push(
         this.renderLockItem(LOCK_OPTIONS.LOCK_ALL),
         this.renderLockItem(LOCK_OPTIONS.WEBCAM_LOCK),
         this.renderLockItem(LOCK_OPTIONS.MIC_LOCK),
         this.renderLockItem(LOCK_OPTIONS.PUBLIC_CHAT_LOCK),
         this.renderLockItem(LOCK_OPTIONS.PRIVATE_CHAT_LOCK),
       );
    }

    return _.compact([
      this.renderLockItem(LOCK_OPTIONS.MUTE_ALL),
      ...roleBasedOptions,
    ]);
  }

  render () {

    return (
      <div>
        {this.renderLockOptions()}
      </div>
    );
  }

};
