import _ from 'lodash';

const MEDIA = Meteor.settings.public.media;
const STUN_TURN_FETCH_URL = MEDIA.stunTurnServersFetchAddress;
const CACHE_STUN_TURN = MEDIA.cacheStunTurnServers;
const FALLBACK_STUN_SERVER = MEDIA.fallbackStunServer;

let STUN_TURN_DICT;
let MAPPED_STUN_TURN_DICT;

const fetchStunTurnServers = function (sessionToken) {
  if (STUN_TURN_DICT && CACHE_STUN_TURN) return Promise.resolve(STUN_TURN_DICT);

  const handleStunTurnResponse = ({ stunServers, turnServers }) => {
    if (!stunServers && !turnServers) {
      return Promise.reject(new Error('Could not fetch STUN/TURN servers'));
    }

    const turnReply = [];
    _.each(turnServers, (turnEntry) => {
      const { password, url, username } = turnEntry;
      turnReply.push({
        urls: url,
        password,
        username,
      });
    });

    const stDictionary = {
      stun: stunServers.map(server => server.url),
      turn: turnReply,
    };

    STUN_TURN_DICT = stDictionary;

    return Promise.resolve(stDictionary);
  };

  const url = `${STUN_TURN_FETCH_URL}?sessionToken=${sessionToken}`;
  return fetch(url, { credentials: 'include' })
    .then(res => res.json())
    .then(handleStunTurnResponse);
};

const mapStunTurn = ({ stun, turn }) => {
  const rtcStuns = stun.map(url => ({ urls: url }));
  const rtcTurns = turn.map(t => ({ urls: t.urls, credential: t.password, username: t.username }));
  return rtcStuns.concat(rtcTurns);
};

const getFallbackStun = () => {
  const stun = FALLBACK_STUN_SERVER ? [FALLBACK_STUN_SERVER] : [];
  return { stun, turn: [] };
};

const getMappedFallbackStun = () => (FALLBACK_STUN_SERVER ? [{ urls: FALLBACK_STUN_SERVER }] : []);

const fetchWebRTCMappedStunTurnServers = function (sessionToken) {
  return new Promise(async (resolve, reject) => {
    try {
      if (MAPPED_STUN_TURN_DICT && CACHE_STUN_TURN) {
        return resolve(MAPPED_STUN_TURN_DICT);
      }

      const stDictionary = await fetchStunTurnServers(sessionToken);

      MAPPED_STUN_TURN_DICT = mapStunTurn(stDictionary);
      return resolve(MAPPED_STUN_TURN_DICT);
    } catch (error) {
      return reject(error);
    }
  });
};

export {
  fetchStunTurnServers,
  fetchWebRTCMappedStunTurnServers,
  getFallbackStun,
  getMappedFallbackStun,
};
