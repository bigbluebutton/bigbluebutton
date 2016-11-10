import RedisPubSub from '/imports/startup/server/redis';
import handleMeetingDestruction from './handlers/meetingDestruction';
import handleRecordingStatusChange from './handlers/recordingStatusChange';
import handlePermissionSettingsChange from './handlers/permissionSettingsChange';
import handleMeetingCreation from './handlers/meetingCreation';
import handleGetAllMettings from './handlers/getAllMeetings';
import handleStunTurnReply from './handlers/stunTurnReply';

RedisPubSub.on('meeting_destroyed_event', handleMeetingDestruction);
RedisPubSub.on('meeting_ended_message', handleMeetingDestruction);
RedisPubSub.on('end_and_kick_all_message', handleMeetingDestruction);
RedisPubSub.on('disconnect_all_users_message', handleMeetingDestruction);
RedisPubSub.on('recording_status_changed_message', handleRecordingStatusChange);
RedisPubSub.on('new_permission_settings', handlePermissionSettingsChange);
RedisPubSub.on('meeting_created_message', handleMeetingCreation);
RedisPubSub.on('get_all_meetings_reply_message', handleGetAllMettings);
RedisPubSub.on('send_stun_turn_info_reply_message', handleStunTurnReply);
