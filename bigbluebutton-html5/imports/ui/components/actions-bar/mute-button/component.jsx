import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../styles.scss';

export default class MuteAudioComponent extends React.Component {

  render() {
    const { isInAudio, isMuted, muteUser, unmuteUser } = this.props;
    let onClick = muteUser;
    let label = 'Mute';
    let cn = !isInAudio ? styles.invisible : null;
    let ti = !isInAudio ? -1 : 0;

    if (isMuted) {
      onClick = unmuteUser;
      label = 'Unmute';
    }

    if (!isInAudio) {
      onClick = this.props.disabledCallback;
    }

    return (
      <Button
        onClick={onClick}
        label={label}
        color={'primary'}
        icon={'audio'}
        size={'lg'}
        circle={true}
        className={cn}
        tabIndex={ti}
      />
    );
  }
}
