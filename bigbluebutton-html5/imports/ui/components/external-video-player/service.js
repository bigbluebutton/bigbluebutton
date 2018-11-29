import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import ExternalVideoStreamer from '/imports/api/external-videos';

import { makeCall } from '/imports/ui/services/api';

const startWatching = (url) => {
  let externalVideoUrl = videoIdFromUrl(url);
  makeCall('startWatchingExternalVideo', {externalVideoUrl});
}

const stopWatching = () => {
  makeCall('stopWatchingExternalVideo');
}

const videoIdFromUrl = (url) => {
  let urlObj = new URL(url);
  let params = new URLSearchParams(urlObj.search);

  return params.get('v');
}

const sendMessage = (event, data) => {
  ExternalVideoStreamer.emit(event,{
      ...data,
      meetingId: Auth._meetingID,
      userId: Auth._userID,
   });
};

const onMessage = (message, func) => {
  ExternalVideoStreamer.on(message, func);
};

const hasExternalVideo = () => {
  let meetingId = Auth._meetingID;
  let meeting = Meetings.findOne({meetingId});

  return meeting && meeting.externalVideoUrl;
}

const getVideoUrl = hasExternalVideo;

export {
  sendMessage,
  onMessage,
  hasExternalVideo,
  getVideoUrl,
  updateVideoUrl,
  startWatching,
  stopWatching,
};
