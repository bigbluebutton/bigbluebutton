import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import styles from '../../styles.scss';
import Service from './service';

const lockItems = [
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

  renderLockItem(lockItem) {
    return (
      <div className={styles.row} role='presentation'>
        <label>
          <input
            className={styles.checkboxOffset}
            type="checkbox"
            tabIndex={lockItem.tabIndex}
            aria-labelledby={lockItem.ariaLabelledBy}
            aria-describedby={lockItem.ariaDescribedBy} />
          {lockItem.label}
        </label>
        <div id={lockItem.ariaLabelledBy} hidden>{lockItem.ariaLabel}</div>
        <div id={lockItem.ariaDescribedBy} hidden>{lockItem.ariaDesc}</div>
      </div>
    );
  }

  getLockOptions () {
    let index = 0;
    return _.compact([
      (this.renderLockItem(lockItems[index++])),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockItems[index++]) : null),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockItems[index++]) : null),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockItems[index++]) : null),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockItems[index++]) : null),
      (this.props.isPresenter || this.props.role === 'MODERATOR'
        ? this.renderLockItem(lockItems[index++]) : null),
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
