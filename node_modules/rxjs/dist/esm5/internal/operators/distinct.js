import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';
export function distinct(keySelector, flushes) {
    return operate(function (source, subscriber) {
        var distinctKeys = new Set();
        source.subscribe(new OperatorSubscriber(subscriber, function (value) {
            var key = keySelector ? keySelector(value) : value;
            if (!distinctKeys.has(key)) {
                distinctKeys.add(key);
                subscriber.next(value);
            }
        }));
        flushes === null || flushes === void 0 ? void 0 : flushes.subscribe(new OperatorSubscriber(subscriber, function () { return distinctKeys.clear(); }, noop));
    });
}
//# sourceMappingURL=distinct.js.map