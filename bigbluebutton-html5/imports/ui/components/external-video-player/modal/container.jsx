import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ExternalVideoModal from './component';
import { startWatching, getVideoUrl } from '../service';
import ExternalVideoPlayerModal from '../external-video-player-graphql/modal/component';

const ExternalVideoModalContainer = (props) => <ExternalVideoModal {...props} />;

withTracker(() => ({
  startWatching,
  videoUrl: getVideoUrl(),
}))(ExternalVideoModalContainer);

export default ExternalVideoPlayerModal;
