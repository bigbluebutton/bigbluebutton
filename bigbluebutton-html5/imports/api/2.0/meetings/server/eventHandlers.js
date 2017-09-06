import RedisPubSub from '/imports/startup/server/redis2x';
import handleMeetingCreation from './handlers/meetingCreation';
import handleGetAllMeetings from './handlers/getAllMeetings';
import handleMeetingEnd from './handlers/meetingEnd';
import handleMeetingLocksChange from './handlers/meetingLockChange';
import handleUserLockChange from './handlers/userLockChange';

RedisPubSub.on('MeetingCreatedEvtMsg', handleMeetingCreation);
RedisPubSub.on('SyncGetMeetingInfoRespMsg', handleGetAllMeetings);
RedisPubSub.on('MeetingEndingEvtMsg', handleMeetingEnd);
RedisPubSub.on('LockSettingsInMeetingChangedEvtMsg', handleMeetingLocksChange);
RedisPubSub.on('UserLockedInMeetingEvtMsg', handleUserLockChange);