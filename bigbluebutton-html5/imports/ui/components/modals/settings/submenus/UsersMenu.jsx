import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';
import styles from './styles';

export default class UsersMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div style={{ height: '100%' }}>
        <div style={{ height: '20%' }}>
          <label><input type='checkbox' />Mute all except the presenter</label>
        </div>
        <div style={{ height: '20%' }}>
          <label><input type="checkbox" />Lock all participants</label>
        </div>
        <ul>
          <li><label><input type="checkbox" />Webcam</label></li>
          <li><label><input type="checkbox" />Microphone</label></li>
          <li><label><input type="checkbox" />Public chat</label></li>
          <li><label><input type="checkbox" />Private chat</label></li>
          <li><label><input type="checkbox" />Layout</label></li>
        </ul>
      </div>
    );
  }
};
