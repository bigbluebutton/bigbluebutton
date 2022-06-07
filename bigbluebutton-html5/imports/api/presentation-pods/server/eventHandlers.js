import RedisPubSub from '/imports/startup/server/redis';
import handleCreateNewPresentationPod from './handlers/createNewPresentationPod';
import handleRemovePresentationPod from './handlers/removePresentationPod';
import handleSyncGetPresentationPods from './handlers/syncGetPresentationPods';
import handleSetPresenterInPod from './handlers/setPresenterInPod';

RedisPubSub.on('CreateNewPresentationPodEvtMsg', handleCreateNewPresentationPod);
RedisPubSub.on('RemovePresentationPodEvtMsg', handleRemovePresentationPod);
RedisPubSub.on('SetPresenterInPodRespMsg', handleSetPresenterInPod);
RedisPubSub.on('SyncGetPresentationPodsRespMsg', handleSyncGetPresentationPods);
