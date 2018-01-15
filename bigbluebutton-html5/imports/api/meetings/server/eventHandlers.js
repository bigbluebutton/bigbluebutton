import RedisPubSub from '/imports/startup/server/redis';
import handleMeetingCreation from './handlers/meetingCreation';
import handleGetAllMeetings from './handlers/getAllMeetings';
import handleMeetingEnd from './handlers/meetingEnd';
import handleMeetingDestruction from './handlers/meetingDestruction';
import handleMeetingLocksChange from './handlers/meetingLockChange';
import handleUserLockChange from './handlers/userLockChange';
import handleRecordingStatusChange from './handlers/recordingStatusChange';

RedisPubSub.on('MeetingCreatedEvtMsg', handleMeetingCreation);
RedisPubSub.on('SyncGetMeetingInfoRespMsg', handleGetAllMeetings);
RedisPubSub.on('MeetingEndingEvtMsg', handleMeetingEnd);
RedisPubSub.on('MeetingDestroyedEvtMsg', handleMeetingDestruction);
RedisPubSub.on('LockSettingsInMeetingChangedEvtMsg', handleMeetingLocksChange);
RedisPubSub.on('UserLockedInMeetingEvtMsg', handleUserLockChange);
RedisPubSub.on('RecordingStatusChangedEvtMsg', handleRecordingStatusChange);
