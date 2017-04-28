import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Audio from './component';
import { joinListenOnly } from '../service';

export default class AudioModalContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    let handleJoinListenOnly = () => {
      return joinListenOnly();
    };

    return (

      <Audio
        handleJoinListenOnly={handleJoinListenOnly}
      />
    );
  }
}
