import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Audio from './component';
import { joinListenOnly } from '/imports/api/phone';

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
