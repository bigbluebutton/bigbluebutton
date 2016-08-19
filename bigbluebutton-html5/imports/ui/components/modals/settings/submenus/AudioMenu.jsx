import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import {joinListenOnly, joinMicrophone, exitAudio} from '/imports/api/phone';
import {shareVertoScreen} from '/imports/api/verto';

export default class AudioMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div>
	<button onClick={shareVertoScreen}>share screen</button>
        <p>inside audio menu</p>
      </div>
    );
  }
};

