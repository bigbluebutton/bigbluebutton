import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/from';
import { noop } from '../util/noop';
export function takeUntil(notifier) {
    return operate((source, subscriber) => {
        innerFrom(notifier).subscribe(new OperatorSubscriber(subscriber, () => subscriber.complete(), noop));
        !subscriber.closed && source.subscribe(subscriber);
    });
}
//# sourceMappingURL=takeUntil.js.map