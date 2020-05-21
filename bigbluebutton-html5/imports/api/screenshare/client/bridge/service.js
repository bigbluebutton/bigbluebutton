import Meetings from '/imports/api/meetings';
import logger from '/imports/startup/client/logger';

const {
  constraints: GDM_CONSTRAINTS,
} = Meteor.settings.public.kurento.screenshare;

const hasDisplayMedia = (typeof navigator.getDisplayMedia === 'function'
  || (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function'));

const getConferenceBridge = () => Meetings.findOne().voiceProp.voiceConf;

const getScreenStream = async () => {
  const gDMCallback = (stream) => {
    if (typeof stream.getVideoTracks === 'function'
        && typeof constraints.video === 'object') {
      stream.getVideoTracks().forEach(track => {
        if (typeof track.applyConstraints  === 'function') {
          track.applyConstraints(constraints.video).catch(error => {
            logger.warn({
              logCode: 'screenshare_videoconstraint_failed',
              extraInfo: { errorName: error.name, errorCode: error.code },
            },
            'Error applying screenshare video constraint');
          });
        }
      });
    }

    if (typeof stream.getAudioTracks === 'function'
        && typeof constraints.audio === 'object') {
      stream.getAudioTracks().forEach(track => {
        if (typeof track.applyConstraints  === 'function') {
          track.applyConstraints(constraints.audio).catch(error => {
            logger.warn({
              logCode: 'screenshare_audioconstraint_failed',
              extraInfo: { errorName: error.name, errorCode: error.code },
            }, 'Error applying screenshare audio constraint');
          });
        }
      });
    }

    return Promise.resolve(stream);
  }

  const constraints = hasDisplayMedia ? GDM_CONSTRAINTS : null;

  // getDisplayMedia isn't supported, generate no stream and let the legacy
  // constraint fetcher work its way on kurento-extension.js
  if (constraints == null) {
    return Promise.resolve();
  } else  {
    if (typeof navigator.getDisplayMedia === 'function') {
      return navigator.getDisplayMedia(constraints)
        .then(gDMCallback)
        .catch(error => {
          logger.error({
            logCode: 'screenshare_getdisplaymedia_failed',
            extraInfo: { errorName: error.name, errorCode: error.code },
          }, 'getDisplayMedia call failed');
          return Promise.resolve();
        });
    } else if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
      return navigator.mediaDevices.getDisplayMedia(constraints)
        .then(gDMCallback)
        .catch(error => {
          logger.error({
            logCode: 'screenshare_getdisplaymedia_failed',
            extraInfo: { errorName: error.name, errorCode: error.code },
          }, 'getDisplayMedia call failed');
          return Promise.resolve();
        });
    }
  }
}


export default {
  hasDisplayMedia,
  getConferenceBridge,
  getScreenStream,
};
