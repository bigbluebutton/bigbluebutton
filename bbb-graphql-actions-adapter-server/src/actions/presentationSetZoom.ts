import { RedisMessage } from '../types';
import { ValidationError } from '../types/ValidationError';
import {throwErrorIfNotPresenter} from "../imports/validation";

export default function buildRedisMessage(sessionVariables: Record<string, unknown>, input: Record<string, unknown>): RedisMessage {
  throwErrorIfNotPresenter(sessionVariables);
  const eventName = `ResizeAndMovePagePubMsg`;

  const routing = {
    meetingId: sessionVariables['x-hasura-meetingid'] as String,
    userId: sessionVariables['x-hasura-userid'] as String
  };

  const header = {
    name: eventName,
    meetingId: routing.meetingId,
    userId: routing.userId
  };

  const body = {
    podId: 'DEFAULT_PRESENTATION_POD',
    presentationId: input.presentationId,
    pageId: input.pageId,
    slideNumber: input.pageNum,
    xOffset: input.xOffset,
    yOffset: input.yOffset,
    widthRatio: input.widthRatio,
    heightRatio: input.heightRatio
  };

  // check(meetingId, String);
  // check(requesterUserId, String);
  // check(slideNumber, Number);
  // check(podId, String);
  // check(widthRatio, Number);
  // check(heightRatio, Number);
  // check(x, Number);
  // check(y, Number);
  //
  // const payload = {
  //   podId,
  //   presentationId,
  //   pageId: `${presentationId}/${slideNumber}`,
  //   xOffset: x,
  //   yOffset: y,
  //   widthRatio,
  //   heightRatio,
  //   slideNumber,
  // };

  return { eventName, routing, header, body };
}
