import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {joinListenOnly, joinMicrophone} from '/imports/api/phone';
import EnterAudio from './component';

class EnterAudioContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <EnterAudio {...this.props}>
        {this.props.children}
      </EnterAudio>
    );
  }
}

export default createContainer(() => {

  const data = {
    handleJoinAudio: () => {
      joinMicrophone();
    },
    
    handleJoinListenOnly: () => {
      joinListenOnly();
    },
  };
  return data;
}, EnterAudioContainer);
