import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';

import handlePresentationUploadTokenPass from './handlers/presentationUploadTokenPass';
import handlePresentationUploadTokenFail from './handlers/presentationUploadTokenFail';

RedisPubSub.on('PresentationUploadTokenPassRespMsg', processForHTML5ServerOnly(handlePresentationUploadTokenPass));
RedisPubSub.on('PresentationUploadTokenFailRespMsg', processForHTML5ServerOnly(handlePresentationUploadTokenFail));
