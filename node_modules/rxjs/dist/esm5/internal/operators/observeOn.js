import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function observeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return operate(function (source, subscriber) {
        source.subscribe(new OperatorSubscriber(subscriber, function (value) { return subscriber.add(scheduler.schedule(function () { return subscriber.next(value); }, delay)); }, function () { return subscriber.add(scheduler.schedule(function () { return subscriber.complete(); }, delay)); }, function (err) { return subscriber.add(scheduler.schedule(function () { return subscriber.error(err); }, delay)); }));
    });
}
//# sourceMappingURL=observeOn.js.map