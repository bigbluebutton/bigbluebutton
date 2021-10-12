import { mergeAll } from '../operators/mergeAll';
import { internalFromArray } from './fromArray';
import { innerFrom } from './from';
import { EMPTY } from './empty';
import { popNumber, popScheduler } from '../util/args';
export function merge(...args) {
    const scheduler = popScheduler(args);
    const concurrent = popNumber(args, Infinity);
    const sources = args;
    return !sources.length
        ?
            EMPTY
        : sources.length === 1
            ?
                innerFrom(sources[0])
            :
                mergeAll(concurrent)(internalFromArray(sources, scheduler));
}
//# sourceMappingURL=merge.js.map