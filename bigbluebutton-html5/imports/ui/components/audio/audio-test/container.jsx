import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/audio/service';
import PropTypes from 'prop-types';
import AudioTest from './component';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {
  children: null,
};

const AudioTestContainer = props => (
  <AudioTest {...props}>
    {props.children}
  </AudioTest>
);

export default createContainer(() => ({
  outputDeviceId: Service.outputDeviceId(),
  handlePlayAudioSample: (deviceId) => {
    const sound = new Audio('resources/sounds/audioSample.mp3');
    if (deviceId && sound.setSinkId) sound.setSinkId(deviceId);
    sound.play();
  },
}), AudioTestContainer);

AudioTestContainer.propTypes = propTypes;
AudioTestContainer.defaultProps = defaultProps;
