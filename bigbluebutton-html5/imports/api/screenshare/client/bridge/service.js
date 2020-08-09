import Meetings from '/imports/api/meetings';
import logger from '/imports/startup/client/logger';
import Media from "../../../../ui/components/media/component";

const {
  constraints: GDM_CONSTRAINTS,
} = Meteor.settings.public.kurento.screenshare;

const hasDisplayMedia = (typeof navigator.getDisplayMedia === 'function'
  || (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function'));

const getConferenceBridge = () => Meetings.findOne().voiceProp.voiceConf;

const getScreenStream = async () => {
  const gDMCallback = (stream) => {
    let audiostreams = []
    let copyStream = new MediaStream();

    if (typeof stream.getVideoTracks === 'function'
        && typeof constraints.video === 'object') {
      stream.getVideoTracks().forEach((track) => {
        if (typeof track.applyConstraints === 'function') {
          track.applyConstraints(constraints.video).catch((error) => {
            logger.warn({
              logCode: 'screenshare_videoconstraint_failed',
              extraInfo: { errorName: error.name, errorCode: error.code },
            },
            'Error applying screenshare video constraint');
          });
        }
      });
      copyStream = new MediaStream(stream.getVideoTracks())
    }

    if (typeof stream.getAudioTracks === 'function'
        && typeof constraints.audio === 'object') {
      stream.getAudioTracks().forEach((track) => {
        stream.removeTrack(track)
        audiostreams.push(track)
        if (typeof track.applyConstraints === 'function') {
          track.applyConstraints(constraints.audio).catch((error) => {
            logger.warn({
              logCode: 'screenshare_audioconstraint_failed',
              extraInfo: { errorName: error.name, errorCode: error.code },
            }, 'Error applying screenshare audio constraint');
          });
        }
      });
    }

    return Promise.resolve(copyStream);
  };

  const constraints = hasDisplayMedia ? GDM_CONSTRAINTS : null;

  // getDisplayMedia isn't supported, generate no stream and let the legacy
  // constraint fetcher work its way on kurento-extension.js
  if (constraints == null) {
    return Promise.resolve();
  }
  if (typeof navigator.getDisplayMedia === 'function') {
    return navigator.getDisplayMedia(constraints)
      .then(gDMCallback)
      .catch((error) => {
        logger.error({
          logCode: 'screenshare_getdisplaymedia_failed',
          extraInfo: { errorName: error.name, errorCode: error.code },
        }, 'getDisplayMedia call failed');
        return Promise.resolve();
      });
  } if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
    return navigator.mediaDevices.getDisplayMedia(constraints)
      .then(gDMCallback)
      .catch((error) => {
        logger.error({
          logCode: 'screenshare_getdisplaymedia_failed',
          extraInfo: { errorName: error.name, errorCode: error.code },
        }, 'getDisplayMedia call failed');
        return Promise.resolve();
      });
  }
};


export default {
  hasDisplayMedia,
  getConferenceBridge,
  getScreenStream,
};
