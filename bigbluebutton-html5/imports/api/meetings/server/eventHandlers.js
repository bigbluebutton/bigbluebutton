import RedisPubSub from '/imports/startup/server/redis';
import handleMeetingCreation from './handlers/meetingCreation';

RedisPubSub.on('MeetingCreatedEvtMsg', handleMeetingCreation);
