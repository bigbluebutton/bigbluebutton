import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import ExternalVideoStreamer from '/imports/api/external-videos';

import { makeCall } from '/imports/ui/services/api';

import ReactPlayer from 'react-player';

const isUrlEmpty = url => !url || url.length === 0;
const isUrlValid = url => ReactPlayer.canPlay(url);

const startWatching = (url) => {
  const externalVideoUrl = url;
  makeCall('startWatchingExternalVideo', { externalVideoUrl });
};

const stopWatching = () => {
  makeCall('stopWatchingExternalVideo');
};

const sendMessage = (event, data) => {
  ExternalVideoStreamer.emit(event, {
    ...data,
    meetingId: Auth.meetingID,
    userId: Auth.userID,
  });
};

const onMessage = (message, func) => {
  ExternalVideoStreamer.on(message, func);
};

const getVideoUrl = () => {
  const meetingId = Auth.meetingID;
  const meeting = Meetings.findOne({ meetingId });

  return meeting && meeting.externalVideoUrl;
};

export {
  sendMessage,
  onMessage,
  getVideoUrl,
  isUrlValid,
  startWatching,
  stopWatching,
};
