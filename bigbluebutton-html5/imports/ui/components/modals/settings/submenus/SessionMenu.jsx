import React from 'react';
import Modal from 'react-modal';
import {Icon} from '/imports/ui/components/shared/Icon.jsx';
import {Button} from '/imports/ui/components/shared/Button.jsx';
import BaseMenu from './BaseMenu.jsx';

export default class SessionMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div>inside session menu</div>
    );
  }
};
