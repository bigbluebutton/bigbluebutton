import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Audio from '/imports/ui/components/audio-modal/component';
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

export default withModalMounter(createContainer(({ mountModal }) => {
  const isPresenter = Service.isUserPresenter();

  const handleExitAudio = () => Service.handleExitAudio();
  const handleOpenJoinAudio = () =>
    mountModal(<Audio handleJoinListenOnly={Service.handleJoinAudio} />);

  return {
    isUserPresenter: isPresenter,
    handleExitAudio: handleExitAudio,
    handleOpenJoinAudio: handleOpenJoinAudio,
  };
}, ActionsBarContainer));
