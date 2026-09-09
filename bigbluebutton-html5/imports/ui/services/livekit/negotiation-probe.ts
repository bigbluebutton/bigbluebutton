import { type Room } from 'livekit-client';
import logger from '/imports/startup/client/logger';

const SLOW_NEGOTIATION_ANSWER_MS = 3000;

type SignalClient = Room['engine']['client'];
type OfferHandler = NonNullable<SignalClient['onOffer']>;

const probed = new WeakSet<SignalClient>();

const countMLines = (sd: RTCSessionDescriptionInit): number | undefined => (typeof sd?.sdp === 'string' ? (sd.sdp.match(/^m=/gm) ?? []).length : undefined);

// Track the time it takes for each subscriber offer to be processed locally and
// handed back to the signal client/socket.
export const probeSubscriberNegotiation = (room: Room, label: string): void => {
  const client = (room.engine as Room['engine'] | undefined)?.client;

  if (!client || probed.has(client)) return;

  probed.add(client);

  // Answers in flight, by offer id, so the handler's end can be tied to the
  // write the SDK does not await.
  const pendingAnswers = new Map<number, Promise<void>>();
  const sendAnswer = client.sendAnswer.bind(client);
  client.sendAnswer = (answer, offerId) => {
    const sent = sendAnswer(answer, offerId);
    pendingAnswers.set(offerId, sent);
    return sent;
  };

  const wrap = (fn: OfferHandler): OfferHandler => async (sd, offerId, midToTrackId) => {
    const startedAt = performance.now();
    const mLines = countMLines(sd);
    let failure: Error | undefined;

    try {
      return await fn(sd, offerId, midToTrackId);
    } catch (error) {
      failure = error as Error;
      throw error;
    } finally {
      const sent = pendingAnswers.get(offerId);
      pendingAnswers.delete(offerId);
      if (sent) await sent.catch(() => undefined);
      const elapsedMs = Math.round(performance.now() - startedAt);
      const extraInfo = {
        label,
        offerId,
        mLines,
        elapsedMs,
        roomState: room.state,
        errorName: failure?.name,
        errorMessage: failure?.message,
      };

      if (!sent) {
        logger.warn({
          logCode: 'livekit_subscriber_offer_unanswered',
          extraInfo,
        }, `${label}: subscriber offer ${offerId} was not answered (${elapsedMs} ms)`);
      } else if (elapsedMs >= SLOW_NEGOTIATION_ANSWER_MS) {
        logger.warn({
          logCode: 'livekit_subscriber_offer_answered_slow',
          extraInfo,
        }, `${label}: subscriber offer ${offerId} answered in ${elapsedMs} ms`);
      } else {
        logger.debug({
          logCode: 'livekit_subscriber_offer_answered',
          extraInfo,
        }, `${label}: subscriber offer ${offerId} answered in ${elapsedMs} ms`);
      }
    }
  };

  let handler: OfferHandler | undefined = client.onOffer ? wrap(client.onOffer) : undefined;

  Object.defineProperty(client, 'onOffer', {
    configurable: true,
    enumerable: true,
    get: () => handler,
    set: (fn: OfferHandler | undefined) => {
      handler = fn ? wrap(fn) : undefined;
    },
  });
};

export default probeSubscriberNegotiation;
