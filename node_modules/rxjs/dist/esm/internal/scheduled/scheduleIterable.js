import { Observable } from '../Observable';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { isFunction } from '../util/isFunction';
import { caughtSchedule } from '../util/caughtSchedule';
export function scheduleIterable(input, scheduler) {
    return new Observable((subscriber) => {
        let iterator;
        subscriber.add(scheduler.schedule(() => {
            iterator = input[Symbol_iterator]();
            caughtSchedule(subscriber, scheduler, function () {
                const { value, done } = iterator.next();
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                    this.schedule();
                }
            });
        }));
        return () => isFunction(iterator === null || iterator === void 0 ? void 0 : iterator.return) && iterator.return();
    });
}
//# sourceMappingURL=scheduleIterable.js.map