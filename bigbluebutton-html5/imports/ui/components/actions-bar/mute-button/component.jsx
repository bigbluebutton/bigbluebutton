import React from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../styles.scss';

export default class MuteAudio extends React.Component {

  render() {
    const { isInAudio, isMuted, callback, isTalking} = this.props;
    let label = !isMuted ? 'Mute' : 'Unmute';
    let icon = !isMuted ? 'unmute' : 'mute';
    let tabIndex = !isInAudio ? -1 : 0;
    let className = null;

    if (isInAudio && isTalking) {
      className = styles.circleGlow;
    }

    if (isInAudio) {
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
    }else{
      return null;
    }
  }
}
