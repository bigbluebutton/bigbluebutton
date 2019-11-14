import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';
import logger from '/imports/startup/client/logger';

const defaultIceServersList = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.ekiga.net' },
  { urls: 'stun:stun.ideasip.com' },
  { urls: 'stun:stun.schlund.de' },
  { urls: 'stun:stun.stunprotocol.org:3478' },
  { urls: 'stun:stun.voiparound.com' },
  { urls: 'stun:stun.voipbuster.com' },
  { urls: 'stun:stun.voipstunt.com' },
  { urls: 'stun:stun.voxgratia.org' },
  { urls: 'stun:stun.services.mozilla.com' },
];

const getSessionToken = () => Auth.sessionToken;

export async function getIceServersList() {
  try {
    const iceServers = await fetchWebRTCMappedStunTurnServers(getSessionToken());

    return iceServers || defaultIceServersList;
  } catch (error) {
    return defaultIceServersList;
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
          reject();
        }
      };

      setTimeout(() => {
        pc.close();
        if (!countIceCandidates) reject();
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
 * given. Since our media servers aren't able to make it work by prflx
 * candidates, we need to do this.
 */
export function tryGenerateIceCandidates() {
  return new Promise((resolve, reject) => {
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
