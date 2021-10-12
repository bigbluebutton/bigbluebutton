import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';
export function ignoreElements() {
    return operate(function (source, subscriber) {
        source.subscribe(new OperatorSubscriber(subscriber, noop));
    });
}
//# sourceMappingURL=ignoreElements.js.map