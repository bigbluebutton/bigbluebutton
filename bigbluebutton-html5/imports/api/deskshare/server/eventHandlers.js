import RedisPubSub from '/imports/startup/server/redis';
import incomingDeskshareEvent from './handlers/incomingDeskshareEvent';

RedisPubSub.on('desk_share_notify_viewers_rtmp', incomingDeskshareEvent);
RedisPubSub.on('desk_share_notify_a_single_viewer', incomingDeskshareEvent);
