import { operate } from '../util/lift';
import { innerFrom } from '../observable/from';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { OperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../util/noop';
export function onErrorResumeNext(...sources) {
    const nextSources = argsOrArgArray(sources);
    return operate((source, subscriber) => {
        const remaining = [source, ...nextSources];
        const subscribeNext = () => {
            if (!subscriber.closed) {
                if (remaining.length > 0) {
                    let nextSource;
                    try {
                        nextSource = innerFrom(remaining.shift());
                    }
                    catch (err) {
                        subscribeNext();
                        return;
                    }
                    const innerSub = new OperatorSubscriber(subscriber, undefined, noop, noop);
                    subscriber.add(nextSource.subscribe(innerSub));
                    innerSub.add(subscribeNext);
                }
                else {
                    subscriber.complete();
                }
            }
        };
        subscribeNext();
    });
}
//# sourceMappingURL=onErrorResumeNext.js.map