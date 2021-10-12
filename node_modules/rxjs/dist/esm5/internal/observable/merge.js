import { mergeAll } from '../operators/mergeAll';
import { internalFromArray } from './fromArray';
import { innerFrom } from './from';
import { EMPTY } from './empty';
import { popNumber, popScheduler } from '../util/args';
export function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    var concurrent = popNumber(args, Infinity);
    var sources = args;
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