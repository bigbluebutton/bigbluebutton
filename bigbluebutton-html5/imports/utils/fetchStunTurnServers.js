const MEDIA = Meteor.settings.public.media;
const STUN_TURN_FETCH_URL = MEDIA.stunTurnServersFetchAddress;

const fetchStunTurnServers = function (sessionToken) {
  const handleStunTurnResponse = ({ stunServers, turnServers }) => {
    if (!stunServers && !turnServers) {
      return { error: 404, stun: [], turn: [] };
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

    return {
      stun: stunServers.map(server => server.url),
      turn: turnReply,
    };
  };

  const url = `${STUN_TURN_FETCH_URL}?sessionToken=${sessionToken}`;
  return fetch(url, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(handleStunTurnResponse)
    .then((response) => {
      if (response.error) {
        return Promise.reject('Could not fetch the stuns/turns servers!');
      }
      return response;
    });
}

const fetchWebRTCMappedStunTurnServers = function (sessionToken) {
  return new Promise(async (resolve, reject) => {
    try {
      const { stun, turn } = await fetchStunTurnServers(sessionToken);
      const rtcStuns = stun.map(url => ({ urls: url }));
      const rtcTurns = turn.map(t => ({ urls: t.urls, credential: t.password, username: t.username }));
      return resolve(rtcStuns.concat(rtcTurns));
    } catch (error) {
      return reject(error);
    }
  });
};

export { fetchStunTurnServers, fetchWebRTCMappedStunTurnServers };
