import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import {joinVoiceCall, exitVoiceCall} from '/imports/api/phone';

export default class AudioMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div>
        <p>inside audio menu</p>

        <button onClick={
          function () {
            exitVoiceCall(function () {console.log('exit callback');});
          }
        }>exit voice call</button>
        <br/>
        <button onClick={
          function () {
            joinVoiceCall({ isListenOnly: true });
          }
        }>listen only</button>

        <button onClick={
          function () {
            joinVoiceCall({ isListenOnly: false });
          }
        }>join mic</button>
      </div>
    );
  }
};
