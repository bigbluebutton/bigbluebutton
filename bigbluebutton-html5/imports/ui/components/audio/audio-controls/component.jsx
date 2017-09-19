import React, { Component } from 'react';
import MuteAudioContainer from '../mute-button/container';
import OpenAudioModalButton from '../open-audio-modal-button/container';
import styles from './styles.scss';
import Button from '/imports/ui/components/button/component';


export default ({
  handleToggleMuteMicrophone,
  handleJoinAudio,
  handleLeaveAudio,
  mute,
  unmute,
  join,
 }) => (
  <span className={styles.container}>
    {mute ?
      <Button
        onClick={handleToggleMuteMicrophone}
        label={unmute ? 'Unmute' : 'Mute'}
        color={'primary'}
        icon={unmute ? 'mute' : 'unmute'}
        size={'lg'}
        circle
      /> : null}
    <Button
      onClick={ join ? handleLeaveAudio : handleJoinAudio }
      label={ join ? 'Leave Audio' : 'Join Audio'}
      color={ join ? 'danger' : 'primary' }
      icon={ join ? 'audio_off' : 'audio_on' }
      size={'lg'}
      circle
    />
  </span>);
