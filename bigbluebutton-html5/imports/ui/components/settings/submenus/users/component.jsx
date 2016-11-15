import React from 'react';
import BaseMenu from '../base/component';
import ParticipantsMenu from './participants/component';

export default class UsersMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ParticipantsMenu />
    );
  }
};
