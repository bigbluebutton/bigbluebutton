import { operate } from '../util/lift';
import { innerFrom } from '../observable/from';
import { OperatorSubscriber } from './OperatorSubscriber';
export function exhaustAll() {
    return operate((source, subscriber) => {
        let isComplete = false;
        let innerSub = null;
        source.subscribe(new OperatorSubscriber(subscriber, (inner) => {
            if (!innerSub) {
                innerSub = innerFrom(inner).subscribe(new OperatorSubscriber(subscriber, undefined, () => {
                    innerSub = null;
                    isComplete && subscriber.complete();
                }));
            }
        }, () => {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
//# sourceMappingURL=exhaustAll.js.map