import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';
import { exitAudio, handleJoinAudio } from '../audio/service';

class ActionsBarContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ActionsBar
        {...this.props}>
          {this.props.children}
      </ActionsBar>
    );
  }
}

export default createContainer(() => {
  const isPresenter = Service.isUserPresenter();
  const handleExitAudio = () => exitAudio();
  const handleOpenJoinAudio = () => handleJoinAudio();

  return {
    isUserPresenter: isPresenter,
    handleExitAudio: handleExitAudio,
    handleOpenJoinAudio: handleOpenJoinAudio,
  };
}, ActionsBarContainer);
