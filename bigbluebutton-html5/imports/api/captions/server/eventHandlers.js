import RedisPubSub from '/imports/startup/server/redis';
import { processForCaptionsPadOnly } from '/imports/api/captions/server/helpers';
import handlePadCreate from './handlers/padCreate';
import handlePadUpdate from './handlers/padUpdate';

RedisPubSub.on('PadCreateSysMsg', processForCaptionsPadOnly(handlePadCreate));
RedisPubSub.on('PadUpdateSysMsg', processForCaptionsPadOnly(handlePadUpdate));
