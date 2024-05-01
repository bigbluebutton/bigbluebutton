import { VideoStreamsUsersResponse } from './queries';
import { ConnectingStream, Stream } from './state';

export type StreamItem = Stream | NonNullable<ConnectingStream>;
export type GridItem = VideoStreamsUsersResponse['user'][number] & { type: 'grid' };
export type VideoItem = StreamItem | GridItem;
