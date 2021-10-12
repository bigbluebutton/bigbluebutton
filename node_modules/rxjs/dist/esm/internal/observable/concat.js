import { concatAll } from '../operators/concatAll';
import { internalFromArray } from './fromArray';
import { popScheduler } from '../util/args';
export function concat(...args) {
    return concatAll()(internalFromArray(args, popScheduler(args)));
}
//# sourceMappingURL=concat.js.map