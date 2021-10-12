import { internalFromArray } from './fromArray';
import { scheduleArray } from '../scheduled/scheduleArray';
import { popScheduler } from '../util/args';
export function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    return scheduler ? scheduleArray(args, scheduler) : internalFromArray(args);
}
//# sourceMappingURL=of.js.map