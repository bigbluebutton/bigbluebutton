import { internalFromArray } from './fromArray';
import { scheduleArray } from '../scheduled/scheduleArray';
import { popScheduler } from '../util/args';
export function of(...args) {
    const scheduler = popScheduler(args);
    return scheduler ? scheduleArray(args, scheduler) : internalFromArray(args);
}
//# sourceMappingURL=of.js.map