import RedisPubSub from '/imports/startup/server/redis';
import handleQuestionQuizStarted from './handlers/questionQuizStarted';
import handleQuestionQuizStopped from './handlers/questionQuizStopped';
import handleQuestionQuizPublished from './handlers/questionQuizPublished';
import handleUserVoted from './handlers/userVoted';
import handleUserResponded from './handlers/userResponded';

RedisPubSub.on('QuestionQuizShowResultEvtMsg', handleQuestionQuizPublished);
RedisPubSub.on('QuestionQuizStartedEvtMsg', handleQuestionQuizStarted);
RedisPubSub.on('QuestionQuizStoppedEvtMsg', handleQuestionQuizStopped);
RedisPubSub.on('QuestionQuizUpdatedEvtMsg', handleUserVoted);
RedisPubSub.on('UserRespondedToQuestionQuizRespMsg', handleUserResponded);
