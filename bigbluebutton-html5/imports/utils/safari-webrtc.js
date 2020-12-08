import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun,
} from '/imports/utils/fetchStunTurnServers';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';
import logger from '/imports/startup/client/logger';

const ICE_GATHERING_CHECK_ENABLED = Meteor.settings.public.media.recvonlyIceGatheringCheck;
const getSessionToken = () => Auth.sessionToken;

export async function getIceServersList() {
  try {
    const iceServers = await fetchWebRTCMappedStunTurnServers(getSessionToken());
    return iceServers;
  } catch (error) {
    return getMappedFallbackStun();
  }
}

export function canGenerateIceCandidates() {
  return new Promise((resolve, reject) => {
    if (Session.get('canGenerateIceCandidates')) {
      resolve();
      return;
    }

    getIceServersList().catch((e) => {
      reject(e);
    }).then((iceServersReceived) => {
      const pc = new RTCPeerConnection({ iceServers: iceServersReceived });
      let countIceCandidates = 0;

      try { pc.addTransceiver('audio'); } catch (e) { }
      pc.onicecandidate = function (e) {
        if (countIceCandidates) return;
        if (e.candidate && e.candidate.candidate.indexOf('.local') === -1) {
          countIceCandidates++;
          Session.set('canGenerateIceCandidates', true);
          resolve();
        }
      };

      pc.onicegatheringstatechange = function (e) {
        if (e.currentTarget.iceGatheringState === 'complete' && countIceCandidates === 0) {
          logger.warn({ logCode: 'no_valid_candidate' }, 'No useful ICE candidate found. Will request gUM permission.');
          reject(new Error('No valid candidate'));
        }
      };

      setTimeout(() => {
        pc.close();
        if (!countIceCandidates) reject(new Error('Gathering check timeout'));
      }, 5000);

      const p = pc.createOffer({ offerToReceiveVideo: true });
      p.then((answer) => { pc.setLocalDescription(answer); });
    });
  });
}

/*
 * Try to generate candidates for a recvonly RTCPeerConnection without
 * a gUM permission and check if there are any candidates generated other than
 * a mDNS host candidate. If there aren't, forcefully request gUM permission
 * for mic (best chance of a gUM working is mic) to try and make the browser
 * generate at least srflx candidates.
 * This is a workaround due to a behaviour some browsers display (mainly Safari)
 * where they won't generate srflx or relay candidates if no gUM permission is
 * given.
 *
 *
 * UPDATE:
 * This used to be valid when Kurento wasn't treating prflx candidates properly.
 * It is now, so this workaround is being revisited. I've put it under a flag
 * so that we can field trial it disabled and gauge the impact of removing it.
 * Hopelly we can get rid of it.
 *
 * prlanzarin 11-11-20
 */
export function tryGenerateIceCandidates() {
  return new Promise((resolve, reject) => {
    if (!ICE_GATHERING_CHECK_ENABLED) return resolve();
    canGenerateIceCandidates().then(() => {
      resolve();
    }).catch(() => {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(() => {
        logger.info({ logCode: 'no_valid_candidate_gum_success' }, 'Forced gUM to release additional ICE candidates succeeded.');
        canGenerateIceCandidates().then(() => {
          resolve();
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    });
  });
}
