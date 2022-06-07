import RedisPubSub from '/imports/startup/server/redis';
import handleUserInformation from './handlers/userInformation';

RedisPubSub.on('LookUpUserRespMsg', handleUserInformation);
