import React, { Component } from 'react';
import logger from '/imports/startup/client/logger';
import UserOptions from './component';

export default class UserOptionsContainer extends Component {
  constructor(props) {
    super(props);

    this.muteAllUsers = this.muteAllUsers.bind(this);
    this.muteAllUsersExceptPresenter = this.muteAllUsersExceptPresenter.bind(this);
    this.handleLockView = this.handleLockView.bind(this);
    this.handleClearStatus = this.handleClearStatus.bind(this);
  }

  muteAllUsers() {
    logger.info('muteAllUsers function');
  }

  muteAllUsersExceptPresenter() {
    logger.info('muteAllUsersExceptPresenter function');
  }

  handleLockView() {
    logger.info('handleLockView function');
  }

  handleClearStatus() {
    logger.info('handleClearStatus function');
  }

  render() {
    return (
      <UserOptions
        toggleMuteAllUsers={this.muteAllUsers}
        toggleMuteAllUsersExceptPresenter={this.muteAllUsersExceptPresenter}
        toggleLockView={this.handleLockView}
        toggleStatus={this.handleClearStatus}
      />
    );
  }
}
