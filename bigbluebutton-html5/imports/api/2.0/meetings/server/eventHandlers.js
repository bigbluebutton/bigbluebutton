import RedisPubSub from '/imports/startup/server/redis2x';
import handleMeetingCreation from './handlers/meetingCreation';
import handleGetAllMeetings from './handlers/getAllMeetings';

RedisPubSub.on('MeetingCreatedEvtMsg', handleMeetingCreation);
RedisPubSub.on('SyncGetMeetingInfoRespMsg', handleGetAllMeetings);
