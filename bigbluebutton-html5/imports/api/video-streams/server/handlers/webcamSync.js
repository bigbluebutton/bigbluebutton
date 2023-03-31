import { check } from 'meteor/check';
import { addWebcamSync } from '../modifiers/sharedWebcam';
import VideoStreams from '/imports/api/video-streams/';
import updatedVideoStream from '../modifiers/updatedVideoStream';
import unsharedWebcam from '../modifiers/unsharedWebcam';

export default async function handleWebcamSync({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);
  const { webcamListSync } = body;
  check(webcamListSync, Array);

  const streamsIds = webcamListSync.map((webcam) => webcam.stream);

  const webcamStreams = VideoStreams.find({
    meetingId,
    stream: { $in: streamsIds },
  }, {
    fields: {
      stream: 1,
    },
  }).fetchAsync();

  const webcamStreamsToUpdate = webcamStreams.map((m) => m.stream);

  await Promise.all(webcamListSync.map(async (webcam) => {
    if (webcamStreamsToUpdate.indexOf(webcam.stream) >= 0) {
      // stream already exist, then update
      await updatedVideoStream(meetingId, webcam);
    } else {
      // stream doesn't exist yet, then add it
      await addWebcamSync(meetingId, webcam);
    }
  }));

  // removing extra video streams already existing in Mongo
  const videoStreamsToRemove = await VideoStreams.find({
    meetingId,
    stream: { $nin: streamsIds },
  }, {
    fields: {
      stream: 1,
      userId: 1,
    },
  }).fetchAsynch();

  await Promise.all(videoStreamsToRemove
    .map(async (videoStream) => {
      await unsharedWebcam(meetingId, videoStream.userId, videoStream.stream);
    }));
}
