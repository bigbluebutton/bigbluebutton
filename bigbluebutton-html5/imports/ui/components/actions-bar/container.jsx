import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ActionsBar from './component';
import Service from './service';
import AudioService from '../audio/service';

import AudioModal from '../audio/audio-modal/component';

class ActionsBarContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ActionsBar
        {...this.props}
      >
        {this.props.children}
      </ActionsBar>
    );
  }
}

export default withModalMounter(createContainer(({ mountModal }) => {
  const isPresenter = Service.isUserPresenter();

  const handleExitAudio = () => AudioService.exitAudio();
  const handleOpenJoinAudio = () =>
    mountModal(<AudioModal handleJoinListenOnly={AudioService.joinListenOnly} />);

  return {
    isUserPresenter: isPresenter,
    handleExitAudio,
    handleOpenJoinAudio,
  };
}, ActionsBarContainer));
