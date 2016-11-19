import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import styles from '../../styles.scss';
import Service from './service';

const lockOptions = [
  {
    label: 'Mute all except the presenter',
    ariaLabelledBy: 'muteALlLabel',
    ariaDescribedBy: 'muteAllDesc',
    ariaLabel: 'Mute all',
    ariaDesc: 'Mutes all participants except the presenter.',
    tabIndex: 7,
  },
  {
    label: 'Lock all participants',
    ariaLabelledBy: 'lockAllLabel',
    ariaDescribedBy: 'lockAllDesc',
    ariaLabel: 'Lock all',
    ariaDesc: 'Toggles locked status for all participants.',
    tabIndex: 8,
  },
  {
    label: 'Webcam',
    ariaLabelledBy: 'webcamLabel',
    ariaDescribedBy: 'webcamDesc',
    ariaLabel: 'Webcam lock',
    ariaDesc: 'Disables the webcam for all locked participants.',
    tabIndex: 9,
  },
  {
    label: 'Microphone',
    ariaLabelledBy: 'micLabel',
    ariaDescribedBy: 'micDesc',
    ariaLabel: 'Microphone lock',
    ariaDesc: 'Disables the microphone for all locked participants.',
    tabIndex: 10,
  },
  {
    label: 'Public chat',
    ariaLabelledBy: 'pubChatLabel',
    ariaDescribedBy: 'pubChatDesc',
    ariaLabel: 'Public chat lock',
    ariaDesc: 'Disables public chat for all locked participants.',
    tabIndex: 11,
  },
  {
    label: 'Private chat',
    ariaLabelledBy: 'privChatLabel',
    ariaDescribedBy: 'privChatDesc',
    ariaLabel: 'Private chat lock',
    ariaDesc: 'Disables private chat for all locked participants.',
    tabIndex: 12,
  },
];

export default class ParticipantsMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  renderLockItem(lockOption) {
    return (
      <div className={styles.row} role='presentation' key={lockOption.ariaLabel}>
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

  getLockOptions () {
    let i = 0;
    return _.compact([
      (this.renderLockItem(lockOptions[i++])),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockOptions[i++]) : null),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockOptions[i++]) : null),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockOptions[i++]) : null),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockOptions[i++]) : null),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockOptions[i++]) : null),
    ]);
  }

  render () {

    return (
      <div>
        {this.getLockOptions()}
      </div>
    );
  }

};
