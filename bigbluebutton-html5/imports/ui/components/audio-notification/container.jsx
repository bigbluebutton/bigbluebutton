import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'underscore';
import AudioNotification from './component';
import styles from './styles.scss';
import Button from '/imports/ui/components/button/component';

export default class AudioNotificationContainer extends Component {
  constructor(props) {
    super(props);

    this.color = null;
    this.message = null;

    this.state = {
      status: null,
    }

    this.handleAudioFailure = this.handleAudioFailure.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    window.addEventListener("bbb.webrtc.failed", this.handleAudioFailure);
  }

  componentWillUnmount() {
    window.removeEventListener("bbb.webrtc.failed", this.handleAudioFailure);
  }

  handleClose(){
    this.color = null;
    this.message = null;
    this.setState({status: null});
  }

  handleAudioFailure() {
    this.color = 'danger';
    this.message = 'Your audio connection failed to connect. Try again';
    this.setState({status: 'failed'});
  }

  render() {

    const handleClose = this.handleClose;

    return(
      <AudioNotification
        color={this.color}
        message={this.message}
        handleClose={this.handleClose}
      />
    );
  }
}
