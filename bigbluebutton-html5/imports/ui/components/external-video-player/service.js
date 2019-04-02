import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import ExternalVideoStreamer from '/imports/api/external-videos';

import { makeCall } from '/imports/ui/services/api';

const YOUTUBE_PREFIX = 'https://youtube.com/watch?v=';

const isUrlEmpty = url => !url || url.length === 0;

const isUrlValid = (url) => {
  const regexp = RegExp('^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$');
  return !isUrlEmpty(url) && url.match(regexp);
};

const getUrlFromVideoId = id => (id ? `${YOUTUBE_PREFIX}${id}` : '');

// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
const videoIdFromUrl = (url) => {
  const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[1].length == 11) ? match[1] : false;
};

const startWatching = (url) => {
  const externalVideoUrl = videoIdFromUrl(url);
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

const getVideoId = () => {
  const meetingId = Auth.meetingID;
  const meeting = Meetings.findOne({ meetingId });

  return meeting && meeting.externalVideoUrl;
};

export {
  sendMessage,
  onMessage,
  getVideoId,
  getUrlFromVideoId,
  isUrlValid,
  startWatching,
  stopWatching,
};
