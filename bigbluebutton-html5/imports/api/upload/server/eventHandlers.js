import RedisPubSub from '/imports/startup/server/redis';
import handleUploadRequestResp from './handlers/uploadRequestResp';

RedisPubSub.on('UploadRequestRespMsg', handleUploadRequestResp);
