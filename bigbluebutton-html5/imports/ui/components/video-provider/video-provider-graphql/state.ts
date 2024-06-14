import { makeVar, useReactiveVar } from '@apollo/client';
import createUseLocalState from '/imports/ui/core/local-states/createUseLocalState';
import type { ConnectingStream, Stream } from './types';

const [useVideoState, setVideoState, videoState] = createUseLocalState({
  isConnecting: false,
  isConnected: false,
  currentVideoPageIndex: 0,
  numberOfPages: 0,
  pageSize: 0,
  userId: null,
});

const getVideoState = () => videoState();

const connectingStream = makeVar<ConnectingStream | null>(null);

const useConnectingStream = (streams?: Stream[]) => {
  const connecting = useReactiveVar(connectingStream);

  if (!connecting) return null;

  const hasStream = streams && streams.find((s) => s.stream === connecting.stream);

  if (hasStream) {
    return null;
  }

  return connecting;
};

const setConnectingStream = (stream: ConnectingStream | null) => {
  connectingStream(stream);
};

const getConnectingStream = () => connectingStream();

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
  getConnectingStream,
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
  getConnectingStream,
  setConnectingStream,
  setStreams,
  getStreams,
  streams,
};
