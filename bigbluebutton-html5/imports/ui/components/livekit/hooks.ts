import {
  useState, useEffect, useCallback, useRef,
} from 'react';
import logger from '/imports/startup/client/logger';

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
  refetch: () => Promise<RTCIceServer[]>;
}

const FETCH_TIMEOUT = 5000;
const MIN_CACHE_TTL_MS = 1_800_000;
const MAX_CACHE_TTL_MS = 86_400_000;
// Refresh prior to expiry
const REFRESH_BUFFER_MS = 60_000;

export const useIceServers = (sessionToken: string): UseIceServersResult => {
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasTurnServer, setHasTurnServer] = useState<boolean>(false);

  const cachedServersRef = useRef<RTCIceServer[] | null>(null);
  const cacheExpiresAtRef = useRef<number | null>(null);
  const currFetchRef = useRef<Promise<RTCIceServer[]> | null>(null);

  const getMappedFallbackStun = useCallback((): RTCIceServer[] => {
    const FALLBACK_STUN_SERVER = window.meetingClientSettings.public.media.fallbackStunServer;
    return FALLBACK_STUN_SERVER ? [{ urls: FALLBACK_STUN_SERVER }] : [];
  }, []);

  const mapIceServers = (dictionary: IceServersDictionary): RTCIceServer[] => {
    const rtcStuns = dictionary.stun.map((url) => ({ urls: url }));
    const rtcTurns = dictionary.turn.map((t) => ({
      urls: t.urls,
      credential: t.password,
      username: t.username,
    }));
    return rtcStuns.concat(rtcTurns);
  };

  const fetchIceServers = useCallback(async (): Promise<{
    dictionary: IceServersDictionary;
    ttlMs: number | null;
  }> => {
    let stunServers: StunServer[] = [];
    let turnServers: TurnServerResponse[] = [];
    let serverDateMs: number | null = null;
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

      const dateHeader = response.headers.get('Date');

      if (dateHeader) {
        const parsed = Date.parse(dateHeader);

        if (!Number.isNaN(parsed)) serverDateMs = parsed;
      }

      ({ stunServers, turnServers } = await response.json());
    } catch (e) {
      throw e instanceof Error ? e : new Error('Request timed out');
    } finally {
      clearTimeout(abort);
    }

    if (!stunServers && !turnServers) {
      throw new Error('Could not fetch STUN/TURN servers');
    }

    const turnReply: TurnServer[] = [];
    let earliestExpirySec: number | null = null;

    turnServers.forEach((turnEntry) => {
      const { password, url, username } = turnEntry;
      const validUntil = parseInt(username.split(':')[0], 10);

      if (Number.isFinite(validUntil) && validUntil > 0) {
        if (earliestExpirySec == null || validUntil < earliestExpirySec) {
          earliestExpirySec = validUntil;
        }
      }

      turnReply.push({
        urls: url,
        password,
        username,
      });
    });

    setHasTurnServer(turnServers.length > 0);

    // Figure out cache TTL from server-side deltas (cred expiry minus
    // the response's Date header) so that any client skew can't produce a
    // nonsensical cache window. If either is missing, leave
    // ttlMs null and presume our min TTL floor (see constants).
    let ttlMs: number | null = null;

    if (earliestExpirySec != null && serverDateMs != null) {
      ttlMs = (earliestExpirySec * 1000) - serverDateMs - REFRESH_BUFFER_MS;
      if (ttlMs < MIN_CACHE_TTL_MS) {
        logger.warn({
          logCode: 'ice_servers_unusual_ttl',
          extraInfo: {
            ttlMs,
            earliestExpirySec,
            serverDateMs,
          },
        }, `STUN/TURN credentials TTL below floor: ${ttlMs}ms (clamped to ${MIN_CACHE_TTL_MS}ms)`);
      }
    }

    return {
      dictionary: {
        stun: stunServers.map((server: StunServer) => server.url),
        turn: turnReply,
      },
      ttlMs,
    };
  }, [sessionToken]);

  const fetchServers = useCallback(async (): Promise<RTCIceServer[]> => {
    const cached = cachedServersRef.current;
    const expiresAt = cacheExpiresAtRef.current;

    if (cached && expiresAt != null && performance.now() < expiresAt) {
      setIceServers(cached);
      setIsLoading(false);
      return cached;
    }

    if (currFetchRef.current) return currFetchRef.current;

    setIsLoading(true);
    setError(null);

    const promise = (async (): Promise<RTCIceServer[]> => {
      try {
        const { dictionary, ttlMs } = await fetchIceServers();
        const mapped = mapIceServers(dictionary);

        if (mapped.length > 0) {
          const clampedTtl = Math.min(
            MAX_CACHE_TTL_MS,
            Math.max(MIN_CACHE_TTL_MS, ttlMs ?? MIN_CACHE_TTL_MS),
          );
          cachedServersRef.current = mapped;
          cacheExpiresAtRef.current = performance.now() + clampedTtl;
          setIceServers(mapped);
        }

        return mapped;
      } catch (e) {
        const fallbackStun = getMappedFallbackStun();
        const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';

        setHasTurnServer(false);
        setError(e as Error);
        setIceServers(fallbackStun);

        logger.error({
          logCode: 'ice_servers_fetch_failed',
          extraInfo: {
            errorMessage,
            errorStack: (e as Error)?.stack,
          },
        }, `Failed to fetch STUN/TURN servers: ${errorMessage}`);

        return fallbackStun;
      } finally {
        currFetchRef.current = null;
        setIsLoading(false);
      }
    })();

    currFetchRef.current = promise;
    return promise;
  }, [fetchIceServers, getMappedFallbackStun]);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return {
    iceServers,
    isLoading,
    error,
    hasTurnServer,
    refetch: fetchServers,
  };
};

export default useIceServers;
