import RedisPubSub from '/imports/startup/server/redis';
import handlePersistShape from './handlers/persistShape';

RedisPubSub.on('PersistShapePubMsg', handlePersistShape);
