import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../styles.scss';

export default class MuteAudio extends React.Component {

  render() {
    const { isInAudio, isMuted, callback } = this.props;
    let label = !isMuted ? 'Mute' : 'Unmute';
    let icon = !isMuted ? 'audio-off' : 'audio';
    let className = !isInAudio ? styles.invisible : null;
    let tabIndex = !isInAudio ? -1 : 0;

    return (
      <Button
        onClick={callback}
        label={label}
        color={'primary'}
        icon={icon}
        size={'lg'}
        circle={true}
        className={className}
        tabIndex={tabIndex}
      />
    );
  }
}
