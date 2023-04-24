import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ExternalVideoModal from './component';
import { startWatching, getVideoUrl } from '../service';

const ExternalVideoModalContainer = props => <ExternalVideoModal {...props} />;

export default withTracker(() => ({
  startWatching,
  videoUrl: getVideoUrl(),
}))(ExternalVideoModalContainer);
