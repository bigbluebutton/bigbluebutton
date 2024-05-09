import { makeVar, useReactiveVar } from '@apollo/client';
import createUseLocalState from '/imports/ui/core/local-states/createUseLocalState';

const [useVideoState, setVideoState, videoState] = createUseLocalState({
  isConnecting: false,
  isConnected: false,
  currentVideoPageIndex: 0,
  numberOfPages: 0,
  pageSize: 0,
  userId: null,
});

const getVideoState = () => videoState();

export type ConnectingStream = {
  stream: string;
  name: string;
  userId: string;
  type: 'connecting';
} | null;

const connectingStream = makeVar<ConnectingStream>(null);

const useConnectingStream = (streams?: Stream[]) => {
  const connecting = useReactiveVar(connectingStream);

  if (!connecting) return null;

  const hasStream = streams && streams.find((s) => s.stream === connecting.stream);

  if (hasStream) {
    return null;
  }

  return connecting;
};

const setConnectingStream = (stream: ConnectingStream) => {
  connectingStream(stream);
};

export type Stream = {
  stream: string;
  deviceId: string;
  userId: string;
  name: string;
  sortName: string;
  pin: boolean;
  floor: boolean;
  lastFloorTime: string;
  isModerator: boolean;
  type: 'stream';
}

const streams = makeVar<Stream[]>([]);

const setStreams = (vs: Stream[]) => {
  streams(vs);
};

const getStreams = () => streams();

export {
  useVideoState,
  setVideoState,
  getVideoState,
  useConnectingStream,
  setConnectingStream,
  setStreams,
  getStreams,
  streams,
};

export default {
  useVideoState,
  setVideoState,
  getVideoState,
  useConnectingStream,
  setConnectingStream,
  setStreams,
  getStreams,
  streams,
};
