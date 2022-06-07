import RedisPubSub from '/imports/startup/server/redis';
import { processForNotePadOnly } from '/imports/api/note/server/helpers';
import handlePadUpdate from './handlers/padUpdate';

RedisPubSub.on('PadUpdateSysMsg', processForNotePadOnly(handlePadUpdate));
