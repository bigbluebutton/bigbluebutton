import RedisPubSub from '/imports/startup/server/redis';
import handleUploadRequestResp from './handlers/uploadRequestResp';
import handleFileUploadedEvt from './handlers/fileUploadedEvt';

RedisPubSub.on('UploadRequestRespMsg', handleUploadRequestResp);
RedisPubSub.on('FileUploadedEvtMsg', handleFileUploadedEvt);
