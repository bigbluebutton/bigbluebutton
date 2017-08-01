import RedisPubSub from '/imports/startup/server/redis2x';
import handleMeetingCreation from './handlers/meetingCreation';
import handleGetAllMeetings from './handlers/getAllMeetings';
import handleMeetingEnd from './handlers/meetingEnd';

RedisPubSub.on('MeetingCreatedEvtMsg', handleMeetingCreation);
RedisPubSub.on('SyncGetMeetingInfoRespMsg', handleGetAllMeetings);
RedisPubSub.on('MeetingEndingEvtMsg', handleMeetingEnd);
