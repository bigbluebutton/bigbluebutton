import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleQuestionCreated from './handlers/handleQuestionCreated';
import handleQuestionApproved from './handlers/handleQuestionApproved';
import handleQuestionDeleted from './handlers/handleQuestionDeleted';
import handleQuestionAnswered from './handlers/handleQuestionAnswered';
import handleUpvote from './handlers/handleUpvote';
import handleAutoApproveQuestionsChanged from './handlers/handleAutoApproveQuestionsChanged';

RedisPubSub.on('QuestionCreatedEvtMsg', handleQuestionCreated);
RedisPubSub.on('QuestionApprovedEvtMsg', handleQuestionApproved);
RedisPubSub.on('QuestionDeletedEvtMsg', handleQuestionDeleted);
RedisPubSub.on('QuestionAnsweredEvtMsg', handleQuestionAnswered);
RedisPubSub.on('QuestionUpvotedEvtMsg', handleUpvote);
RedisPubSub.on('AutoApproveQuestionsChangedEvtMsg', handleAutoApproveQuestionsChanged);
RedisPubSub.on('GetAutoApproveQuestionsRespMsg', processForHTML5ServerOnly(handleAutoApproveQuestionsChanged));