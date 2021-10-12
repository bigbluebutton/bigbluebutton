import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function observeOn(scheduler, delay = 0) {
    return operate((source, subscriber) => {
        source.subscribe(new OperatorSubscriber(subscriber, (value) => subscriber.add(scheduler.schedule(() => subscriber.next(value), delay)), () => subscriber.add(scheduler.schedule(() => subscriber.complete(), delay)), (err) => subscriber.add(scheduler.schedule(() => subscriber.error(err), delay))));
    });
}
//# sourceMappingURL=observeOn.js.map