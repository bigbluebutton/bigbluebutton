import { EMPTY } from '../observable/empty';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function takeLast(count) {
    return count <= 0
        ? () => EMPTY
        : operate((source, subscriber) => {
            let buffer = [];
            source.subscribe(new OperatorSubscriber(subscriber, (value) => {
                buffer.push(value);
                count < buffer.length && buffer.shift();
            }, () => {
                for (const value of buffer) {
                    subscriber.next(value);
                }
                subscriber.complete();
            }, undefined, () => {
                buffer = null;
            }));
        });
}
//# sourceMappingURL=takeLast.js.map