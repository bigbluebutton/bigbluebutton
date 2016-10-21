import RedisPubSub from '/imports/startup/server/redis';
import handleShowResult from './handlers/showResult';
import handlePollStarted from './handlers/pollStarted';
import handleUserVoted from './handlers/userVoted';

RedisPubSub.on('poll_show_result_message', handleShowResult);
RedisPubSub.on('poll_started_message', handlePollStarted);
RedisPubSub.on('poll_stopped_message', handleShowResult);
RedisPubSub.on('user_voted_poll_message', handleUserVoted);
