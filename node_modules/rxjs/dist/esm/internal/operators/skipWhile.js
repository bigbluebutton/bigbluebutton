import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function skipWhile(predicate) {
    return operate((source, subscriber) => {
        let taking = false;
        let index = 0;
        source.subscribe(new OperatorSubscriber(subscriber, (value) => (taking || (taking = !predicate(value, index++))) && subscriber.next(value)));
    });
}
//# sourceMappingURL=skipWhile.js.map