import { scheduleArray } from '../scheduled/scheduleArray';
import { fromArrayLike } from './from';
export function internalFromArray(input, scheduler) {
    return scheduler ? scheduleArray(input, scheduler) : fromArrayLike(input);
}
//# sourceMappingURL=fromArray.js.map