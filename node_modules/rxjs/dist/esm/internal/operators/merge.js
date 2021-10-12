import { operate } from '../util/lift';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { internalFromArray } from '../observable/fromArray';
import { mergeAll } from './mergeAll';
import { popNumber, popScheduler } from '../util/args';
export function merge(...args) {
    const scheduler = popScheduler(args);
    const concurrent = popNumber(args, Infinity);
    args = argsOrArgArray(args);
    return operate((source, subscriber) => {
        mergeAll(concurrent)(internalFromArray([source, ...args], scheduler)).subscribe(subscriber);
    });
}
//# sourceMappingURL=merge.js.map