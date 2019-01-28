import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import Auth from '/imports/ui/services/auth';
import { Session } from 'meteor/session';

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
      reject();
    }).then((iceServersReceived) => {
      const pc = new RTCPeerConnection({ iceServers: iceServersReceived });
      let countIceCandidates = 0;

      try { pc.addTransceiver('audio'); } catch (e) { }

      pc.onicecandidate = function (e) {
        if (countIceCandidates) return;
        if (e.candidate) {
          countIceCandidates++;
          Session.set('canGenerateIceCandidates', true);
          resolve();
        }
      };

      pc.onicegatheringstatechange = function (e) {
        if (e.currentTarget.iceGatheringState == 'complete' && countIceCandidates == 0) reject();
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

export function tryGenerateIceCandidates() {
  return new Promise((resolve, reject) => {
    canGenerateIceCandidates().then((ok) => {
      resolve();
    }).catch((e) => {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
        canGenerateIceCandidates().then((ok) => {
          resolve();
        }).catch((e) => {
          reject();
        });
      }).catch((e) => {
        reject();
      });
    });
  });
}
