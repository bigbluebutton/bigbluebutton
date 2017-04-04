import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';

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
  const handleExitAudio = () => Service.handleExitAudio();
  const handleOpenJoinAudio = () => Service.handleJoinAudio();

  return {
    isUserPresenter: isPresenter,
    handleExitAudio: handleExitAudio,
    handleOpenJoinAudio: handleOpenJoinAudio,
  };
}, ActionsBarContainer);
