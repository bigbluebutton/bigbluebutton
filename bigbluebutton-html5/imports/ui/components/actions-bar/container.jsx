import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';
import { joinListenOnly } from '/imports/api/phone';

import EmojiContainer from './emoji-menu/container';
import ActionsDropdown from './actions-dropdown/component';
import JoinAudioOptionsContainer from './audio-menu/container';
import MuteAudioContainer from './mute-button/container';


const defaultProps = {
  muteButton: <MuteAudioContainer />,
  actionsButton: <ActionsDropdown />,
  emojiButton: <EmojiContainer />
};

class ActionsBarContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const handleJoinListenOnly = () => joinListenOnly();
    const isInVoiceAudio = Service.isInVoiceAudio();

    return (
      <ActionsBar
       handleJoinListenOnly={handleJoinListenOnly}
       isInVoiceAudio={isInVoiceAudio}
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

ActionsBarContainer.defaultProps = defaultProps;
