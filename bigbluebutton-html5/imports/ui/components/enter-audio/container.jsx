import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {joinListenOnly, joinMicrophone} from '/imports/api/phone';
import EnterAudio from './component';

export default class EnterAudioContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isFullAudio,
    } = this.props;

    let handleJoin = () => isFullAudio ? joinMicrophone() : joinListenOnly();

    return (
      <EnterAudio handleJoin={handleJoin} />
    );
  }
}
