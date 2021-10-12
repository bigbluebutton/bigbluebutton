import { EMPTY } from '../observable/empty';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function repeat(count = Infinity) {
    return count <= 0
        ? () => EMPTY
        : operate((source, subscriber) => {
            let soFar = 0;
            let innerSub;
            const subscribeForRepeat = () => {
                let syncUnsub = false;
                innerSub = source.subscribe(new OperatorSubscriber(subscriber, undefined, () => {
                    if (++soFar < count) {
                        if (innerSub) {
                            innerSub.unsubscribe();
                            innerSub = null;
                            subscribeForRepeat();
                        }
                        else {
                            syncUnsub = true;
                        }
                    }
                    else {
                        subscriber.complete();
                    }
                }));
                if (syncUnsub) {
                    innerSub.unsubscribe();
                    innerSub = null;
                    subscribeForRepeat();
                }
            };
            subscribeForRepeat();
        });
}
//# sourceMappingURL=repeat.js.map