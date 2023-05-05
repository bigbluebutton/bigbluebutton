import { check } from 'meteor/check';
import { addWebcamSync } from '../modifiers/sharedWebcam';
import VideoStreams from '/imports/api/video-streams/';
import updatedVideoStream from '../modifiers/updatedVideoStream';
import unsharedWebcam from '../modifiers/unsharedWebcam';

export default function handleWebcamSync({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);
  const { webcamListSync } = body;
  check(webcamListSync, Array);

  const streamsIds = webcamListSync.map((webcam) => webcam.stream);

  const webcamStreamsToUpdate = VideoStreams.find({
    meetingId,
    stream: { $in: streamsIds },
  }, {
    fields: {
      stream: 1,
    },
  }).fetch()
    .map((m) => m.stream);

  webcamListSync.forEach((webcam) => {
    if (webcamStreamsToUpdate.indexOf(webcam.stream) >= 0) {
      // stream already exist, then update
      updatedVideoStream(meetingId, webcam);
    } else {
      // stream doesn't exist yet, then add it
      addWebcamSync(meetingId, webcam);
    }
  });

  // removing extra video streams already existing in Mongo
  const videoStreamsToRemove = VideoStreams.find({
    meetingId,
    stream: { $nin: streamsIds },
  }, {
    fields: {
      stream: 1,
      userId: 1,
    },
  }).fetch();

  videoStreamsToRemove
    .forEach((videoStream) => unsharedWebcam(meetingId, videoStream.userId, videoStream.stream));
}
