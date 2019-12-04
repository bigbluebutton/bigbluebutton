import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { getStreamer } from '/imports/api/external-videos';
import { makeCall } from '/imports/ui/services/api';

import ReactPlayer from 'react-player';

const isUrlValid = url => ReactPlayer.canPlay(url);

const startWatching = (url) => {
  const externalVideoUrl = url;
  makeCall('startWatchingExternalVideo', { externalVideoUrl });
};

const stopWatching = () => {
  makeCall('stopWatchingExternalVideo');
};

const sendMessage = (event, data) => {
  const streamer = getStreamer(Auth.meetingID);

  streamer.emit(event, {
    ...data,
    meetingId: Auth.meetingID,
    userId: Auth.userID,
  });
};

const onMessage = (message, func) => {
  const streamer = getStreamer(Auth.meetingID);
  streamer.on(message, func);
};

const removeAllListeners = (eventType) => {
  const streamer = getStreamer(Auth.meetingID);
  streamer.removeAllListeners(eventType);
};

const getVideoUrl = () => {
  const meetingId = Auth.meetingID;
  const meeting = Meetings.findOne({ meetingId }, { fields: { externalVideoUrl: 1 } });

  return meeting && meeting.externalVideoUrl;
};

export {
  sendMessage,
  onMessage,
  removeAllListeners,
  getVideoUrl,
  isUrlValid,
  startWatching,
  stopWatching,
};
