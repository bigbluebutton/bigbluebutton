import { makeVar, useReactiveVar } from '@apollo/client';
import type { ConnectingStream, Stream } from './types';

interface State {
  isConnecting: boolean;
  isConnected: boolean;
  currentVideoPageIndex: number;
  numberOfPages: number;
  pageSize: number;
  userId: string | null;
}

const videoState = makeVar<State>({
  isConnecting: false,
  isConnected: false,
  currentVideoPageIndex: 0,
  numberOfPages: 0,
  pageSize: 0,
  userId: null,
});

const useVideoState = () => useReactiveVar(videoState);

const setVideoState = (state: Partial<State>) => {
  videoState({
    ...videoState(),
    ...state,
  });
};

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

// Cameras this client asked to stop. Their rows disappearing is expected, so
// it must not be read as the meeting losing a camera the user still wants.
const expectedStreamStops = new Set<string>();

const expectStreamStop = (stream: string) => {
  expectedStreamStops.add(stream);
};

const consumeExpectedStreamStop = (stream: string) => expectedStreamStops.delete(stream);

export {
  useVideoState,
  setVideoState,
  getVideoState,
  expectStreamStop,
  consumeExpectedStreamStop,
  useConnectingStream,
  getConnectingStream,
  setConnectingStream,
};

export default {
  useVideoState,
  setVideoState,
  getVideoState,
  useConnectingStream,
  getConnectingStream,
  setConnectingStream,
};
