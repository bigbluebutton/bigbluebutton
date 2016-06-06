import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from './BaseMenu';

export default class SessionMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div style={{ height: '100%' }}>
        <p style={{ float: 'left' }}>inside session menu</p>
      </div>
    );
  }
};
