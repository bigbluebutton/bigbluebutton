import { useState, useEffect, useCallback } from 'react';

interface StunServer {
  url: string;
}

interface TurnServerCredentials {
  username: string;
  password: string;
}

// TurnServer is the RTCIceServer representation of a TURN server
interface TurnServer extends TurnServerCredentials {
  urls: string;
}

// TurnServerResponse is the response from the STUN/TURN server fetch endpoint
interface TurnServerResponse extends TurnServerCredentials {
  url: string;
}

interface IceServersDictionary {
  stun: string[];
  turn: TurnServer[];
}

interface UseIceServersResult {
  iceServers: RTCIceServer[];
  isLoading: boolean;
  error: Error | null;
  hasTurnServer: boolean;
  refetch: () => Promise<void>;
}

const FETCH_TIMEOUT = 5000;

export const useIceServers = (sessionToken: string): UseIceServersResult => {
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasSeenTurnServer, setHasSeenTurnServer] = useState<boolean>(false);
  const [cacheValidUntil, setCacheValidUntil] = useState<number | null>(null);
  const [cachedServers, setCachedServers] = useState<RTCIceServer[] | null>(null);

  const getMappedFallbackStun = (): RTCIceServer[] => {
    const FALLBACK_STUN_SERVER = window.meetingClientSettings.public.media.fallbackStunServer;
    return FALLBACK_STUN_SERVER ? [{ urls: FALLBACK_STUN_SERVER }] : [];
  };

  const mapIceServers = (dictionary: IceServersDictionary): RTCIceServer[] => {
    const rtcStuns = dictionary.stun.map((url) => ({ urls: url }));
    const rtcTurns = dictionary.turn.map((t) => ({
      urls: t.urls,
      credential: t.password,
      username: t.username,
    }));
    return rtcStuns.concat(rtcTurns);
  };

  const fetchIceServers = useCallback(async (): Promise<IceServersDictionary> => {
    let stunServers: StunServer[] = [];
    let turnServers: TurnServerResponse[] = [];
    const MEDIA = window.meetingClientSettings.public.media;
    const STUN_TURN_FETCH_URL = MEDIA.stunTurnServersFetchAddress;
    const url = `${STUN_TURN_FETCH_URL}?sessionToken=${sessionToken}`;
    const controller = new AbortController();
    const abort = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ICE servers: ${response.status} ${response.statusText}`);
      }

      ({ stunServers, turnServers } = await response.json());
    } catch (error) {
      throw error instanceof Error ? error : new Error('Request timed out');
    } finally {
      clearTimeout(abort);
    }

    if (!stunServers && !turnServers) {
      throw new Error('Could not fetch STUN/TURN servers');
    }

    const turnReply: TurnServer[] = [];
    let maxTtl: number | null = null;

    turnServers.forEach((turnEntry) => {
      const { password, url, username } = turnEntry;
      const validUntil = parseInt(username.split(':')[0], 10);

      if (!maxTtl || (validUntil && validUntil < maxTtl)) {
        maxTtl = validUntil;
      }

      turnReply.push({
        urls: url,
        password,
        username,
      });
    });

    setHasSeenTurnServer(turnServers.length > 0);

    if (maxTtl) setCacheValidUntil(maxTtl);

    return {
      stun: stunServers.map((server: StunServer) => server.url),
      turn: turnReply,
    };
  }, [sessionToken]);

  const fetchServers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const MEDIA = window.meetingClientSettings.public.media;
      const CACHE_STUN_TURN = MEDIA.cacheStunTurnServers;
      const now = Math.floor(Date.now() / 1000);

      if (cachedServers && CACHE_STUN_TURN && cacheValidUntil && now < cacheValidUntil) {
        setIceServers(cachedServers);
        setIsLoading(false);
        return;
      }

      const stDictionary = await fetchIceServers();
      const mapped = mapIceServers(stDictionary);
      if (mapped?.length > 0) {
        setCachedServers(mapped);
        setIceServers(mapped);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch STUN/TURN servers'));
      setIceServers(getMappedFallbackStun());
    } finally {
      setIsLoading(false);
    }
  }, [fetchIceServers, cacheValidUntil, cachedServers]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return {
    iceServers,
    isLoading,
    error,
    hasTurnServer: hasSeenTurnServer,
    refetch: fetchServers,
  };
};

export default useIceServers;
