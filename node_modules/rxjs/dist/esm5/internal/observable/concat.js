import { concatAll } from '../operators/concatAll';
import { internalFromArray } from './fromArray';
import { popScheduler } from '../util/args';
export function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return concatAll()(internalFromArray(args, popScheduler(args)));
}
//# sourceMappingURL=concat.js.map