import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';
export function distinct(keySelector, flushes) {
    return operate((source, subscriber) => {
        const distinctKeys = new Set();
        source.subscribe(new OperatorSubscriber(subscriber, (value) => {
            const key = keySelector ? keySelector(value) : value;
            if (!distinctKeys.has(key)) {
                distinctKeys.add(key);
                subscriber.next(value);
            }
        }));
        flushes === null || flushes === void 0 ? void 0 : flushes.subscribe(new OperatorSubscriber(subscriber, () => distinctKeys.clear(), noop));
    });
}
//# sourceMappingURL=distinct.js.map