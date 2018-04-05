import RedisPubSub from '/imports/startup/server/redis';
import handleCreateNewPresentationPod from './handlers/createNewPresentationPod';
import handleRemovePresentationPod from './handlers/removePresentationPod';
import handleGetAllPresentationPods from './handlers/getAllPresentationPods';
import handleSetPresenterInPod from './handlers/setPresenterInPod';
// import handleSyncGetPresentationPods from './handlers/syncGetPresentationPods';

RedisPubSub.on('CreateNewPresentationPodEvtMsg', handleCreateNewPresentationPod);
RedisPubSub.on('RemovePresentationPodEvtMsg', handleRemovePresentationPod);
// RedisPubSub.on('GetAllPresentationPodsRespMsg', handleGetAllPresentationPods);
RedisPubSub.on('SetPresenterInPodRespMsg', handleSetPresenterInPod);
RedisPubSub.on('SyncGetPresentationPodsRespMsg', handleGetAllPresentationPods);
