import RedisPubSub from '/imports/startup/server/redis';
import handlePollStopped from './handlers/pollStopped';
import handlePollStarted from './handlers/pollStarted';
import handleUserVoted from './handlers/userVoted';

RedisPubSub.on('poll_show_result_message', handlePollStopped);
RedisPubSub.on('poll_started_message', handlePollStarted);
RedisPubSub.on('poll_stopped_message', handlePollStopped);
RedisPubSub.on('user_voted_poll_message', handleUserVoted);
