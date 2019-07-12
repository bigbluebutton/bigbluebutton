import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import ExternalVideoStreamer from '/imports/api/external-videos';

import { makeCall } from '/imports/ui/services/api';

const YOUTUBE_PREFIX = 'https://youtube.com/watch?v=';
const YOUTUBE_REGEX = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;

const isUrlEmpty = url => !url || url.length === 0;

const isUrlValid = url => true;

const getUrlFromVideoId = id => (id ? `${YOUTUBE_PREFIX}${id}` : '');

const videoIdFromUrl = (url) => {
//  const match = YOUTUBE_REGEX.exec(url);
//  return match ? match[1] : false;
  return true;
};

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
  getUrlFromVideoId,
  isUrlValid,
  startWatching,
  stopWatching,
};
