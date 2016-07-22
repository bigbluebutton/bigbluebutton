import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import {joinListenOnly, joinMicrophone, exitAudio} from '/imports/api/phone';
import {vertoWatchVideo} from '/imports/api/verto';
import {presenterDeskshareHasStarted} from '/imports/ui/components/deskshare/service';

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
            exitAudio(function () {console.log('exit callback');});
          }
        }>exit voice call</button>
        <br/>
        <button onClick={
          function () {
            joinListenOnly();
          }
        }>listen only</button>

        <button onClick={
          function () {
            joinMicrophone();
          }
        }>microphone</button>

        <button onClick={
          function () {
            vertoWatchVideo();
          }
        }>watch video</button>
      </div>
    );
  }
};
