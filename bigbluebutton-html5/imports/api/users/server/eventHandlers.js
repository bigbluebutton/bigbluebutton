import RedisPubSub from '/imports/startup/server/redis';
import handleRemoveUser from './handlers/removeUser';
import handlePresenterAssigned from './handlers/presenterAssigned';

RedisPubSub.on('user_eject_from_meeting', handleRemoveUser);
RedisPubSub.on('disconnect_user_message', handleRemoveUser);
RedisPubSub.on('user_left_message', handleRemoveUser);
RedisPubSub.on('presenter_assigned_message', handlePresenterAssigned);
