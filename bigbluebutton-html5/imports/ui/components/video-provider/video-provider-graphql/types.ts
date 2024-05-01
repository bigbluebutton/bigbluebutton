import { VideoStreamsUsersResponse } from './queries';
import { ConnectingStream, Stream } from './state';

export type StreamUser = VideoStreamsUsersResponse['user'][number];
export type StreamItem = Stream | NonNullable<ConnectingStream>;
export type GridItem = StreamUser & { type: 'grid' };
export type VideoItem = StreamItem | GridItem;
