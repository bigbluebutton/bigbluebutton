import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu.jsx';
import {joinVoiceCall} from '/imports/api/phone';

export default class AudioMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    const useSIPAudio = true;
    const isListenOnly = true;
    return (
      <div>
        <p>inside audio menu</p>
        <button onClick={joinVoiceCall.bind(this, { useSIPAudio, isListenOnly })}>
          join audio
        </button>
      </div>
    );
  }
};
