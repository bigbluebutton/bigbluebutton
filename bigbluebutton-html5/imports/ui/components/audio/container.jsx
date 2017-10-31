import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import PropTypes from 'prop-types';
import Breakouts from '/imports/api/2.0/breakouts';
import Service from './service';
import Audio from './component';
import AudioModal from './audio-modal/component';

const propTypes = {
  children: PropTypes.element,
};

const defaultProps = {
  children: null,
};

const AudioContainer = props =>
  (<Audio {...props}>
    {props.children}
  </Audio>
  );

let didMountAutoJoin = false;

export default withModalMounter(createContainer(({ mountModal }) => {
  const APP_CONFIG = Meteor.settings.public.app;

  const { autoJoinAudio } = APP_CONFIG;
  const openAudioModal = mountModal.bind(null,
    <AudioModal
      handleJoinListenOnly={Service.joinListenOnly}
    />);

  Breakouts.find().observeChanges({
    removed() {
      openAudioModal();
    },
  });

  return {
    init: () => {
      Service.init();
      if (!autoJoinAudio || didMountAutoJoin) return;
      openAudioModal();
      didMountAutoJoin = true;
    },
  };
}, AudioContainer));

AudioContainer.propTypes = propTypes;
AudioContainer.defaultProps = defaultProps;
