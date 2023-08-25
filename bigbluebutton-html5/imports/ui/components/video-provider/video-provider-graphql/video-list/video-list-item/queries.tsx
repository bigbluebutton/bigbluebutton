import { gql } from '@apollo/client';

export interface StreamsCounter {
  user_camera_aggregate: { aggregate: { count: number } };
}

export interface PinnedUser {
  user: Array<{
    pinned: boolean;
    cameras: Array<{
      streamId: string;
      userId: string;
    }>;
  }>;
}

export function assertionStreamsCounter(data: unknown): asserts data is streamsCounter {
  if (typeof data !== 'object') {
    throw new Error('data is not object');
  }
  if (!('user_camera_aggregate' in data)) {
    throw new Error('data.user_camera_aggregate is not defined');
  }
  if (typeof data.user_camera_aggregate !== 'object') {
    throw new Error('data.user_camera_aggregate is not object');
  }
  if (!('aggregate' in data.user_camera_aggregate)) {
    throw new Error('data.user_camera_aggregate.aggregate is not defined');
  }
  if (typeof data.user_camera_aggregate.aggregate !== 'object') {
    throw new Error('data.user_camera_aggregate.aggregate is not object');
  }
  if (!('count' in data.user_camera_aggregate.aggregate)) {
    throw new Error('data.user_camera_aggregate.aggregate.count is not defined');
  }
  if (typeof data.user_camera_aggregate.aggregate.count !== 'number') {
    throw new Error('data.user_camera_aggregate.aggregate.count is not number');
  }
}

export function assertionPinnedUser(data: unknown): asserts data is PinnedUser {
  if (typeof data !== 'object') {
    throw new Error('data is not object');
  }
  if (!('user' in data)) {
    throw new Error('data.user is not defined');
  }
  if (!Array.isArray(data.user)) {
    throw new Error('data.user is not array');
  }
  if (data.user.length === 0) {
    throw new Error('data.user is empty');
  }
  if (typeof data.user[0] !== 'object') {
    throw new Error('data.user[0] is not object');
  }
  if (!('pinned' in data.user[0])) {
    throw new Error('data.user[0].pinned is not defined');
  }
  if (typeof data.user[0].pinned !== 'boolean') {
    throw new Error('data.user[0].pinned is not boolean');
  }
  if (!('cameras' in data.user[0])) {
    throw new Error('data.user[0].cameras is not defined');
  }
  if (!Array.isArray(data.user[0].cameras)) {
    throw new Error('data.user[0].cameras is not array');
  }
  if (data.user[0].cameras.length === 0) {
    throw new Error('data.user[0].cameras is empty');
  }
  if (typeof data.user[0].cameras[0] !== 'object') {
    throw new Error('data.user[0].cameras[0] is not object');
  }
  if (!('streamId' in data.user[0].cameras[0])) {
    throw new Error('data.user[0].cameras[0].streamId is not defined');
  }
  if (typeof data.user[0].cameras[0].streamId !== 'string') {
    throw new Error('data.user[0].cameras[0].streamId is not string');
  }
  if (!('userId' in data.user[0].cameras[0])) {
    throw new Error('data.user[0].cameras[0].userId is not defined');
  }
  if (typeof data.user[0].cameras[0].userId !== 'string') {
    throw new Error('data.user[0].cameras[0].userId is not string');
  }
}

export const STREAMS_COUNTER = gql`
subscription streamsCounter {
  user_camera_aggregate {
    aggregate {
      count
    }
  }
}
`;

export const PINNED_USER = gql`
subscription {
  user(where: {pinned: {_eq: true}}) {
    pinned
    userId
    cameras {
      streamId
      userId
    }
  }
}
`;

export default {
  STREAMS_COUNTER,
};
