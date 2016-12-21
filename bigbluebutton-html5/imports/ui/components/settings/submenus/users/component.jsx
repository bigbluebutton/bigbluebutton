import React from 'react';
import BaseMenu from '../base/component';
import ParticipantsMenuContainer from './participants/container';

export default class UsersMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ParticipantsMenuContainer />
    );
  }
};
