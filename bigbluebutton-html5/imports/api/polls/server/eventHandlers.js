import RedisPubSub from '/imports/startup/server/redis';
import handlePollStarted from './handlers/pollStarted';
import handlePollStopped from './handlers/pollStopped';
import handlePollPublished from './handlers/pollPublished';
import handleUserVoted from './handlers/userVoted';

RedisPubSub.on('PollShowResultEvtMsg', handlePollPublished);
RedisPubSub.on('PollStartedEvtMsg', handlePollStarted);
RedisPubSub.on('PollStoppedEvtMsg', handlePollStopped);
RedisPubSub.on('PollUpdatedEvtMsg', handleUserVoted);
