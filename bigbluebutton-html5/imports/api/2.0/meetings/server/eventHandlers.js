import RedisPubSub from '/imports/startup/server/redis2x';
import handleMeetingCreation from './handlers/meetingCreation';

RedisPubSub.on('MeetingCreatedEvtMsg', handleMeetingCreation);
