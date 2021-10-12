import { Observable } from '../Observable';
export function schedulePromise(input, scheduler) {
    return new Observable((subscriber) => {
        return scheduler.schedule(() => input.then((value) => {
            subscriber.add(scheduler.schedule(() => {
                subscriber.next(value);
                subscriber.add(scheduler.schedule(() => subscriber.complete()));
            }));
        }, (err) => {
            subscriber.add(scheduler.schedule(() => subscriber.error(err)));
        }));
    });
}
//# sourceMappingURL=schedulePromise.js.map