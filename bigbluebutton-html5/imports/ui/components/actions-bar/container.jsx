import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';
import { joinListenOnly } from '/imports/api/phone';
import { exitAudio } from '/imports/api/phone';
import { showModal } from '/imports/ui/components/app/service';
import Audio from '/imports/ui/components/audio-modal/component';

class ActionsBarContainer extends Component {
  constructor(props) {
    super(props);
  }

  openJoinAudio() {
    const handleJoinListenOnly = () => joinListenOnly();
    return showModal(<Audio handleJoinListenOnly={handleJoinListenOnly} />);
  }

  render() {
    const handleExitAudio = () => exitAudio();

    return (
      <ActionsBar
        handleExitAudio={handleExitAudio}
        handleOpenJoinAudio={this.openJoinAudio.bind(this)}
        {...this.props}>
          {this.props.children}
      </ActionsBar>
    );
  }
}

export default createContainer(() => {
  let data = Service.isUserPresenter();
  return data;
}, ActionsBarContainer);
