"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.caughtSchedule = void 0;
function caughtSchedule(subscriber, scheduler, execute, delay) {
    if (delay === void 0) { delay = 0; }
    var subscription = scheduler.schedule(function () {
        try {
            execute.call(this);
        }
        catch (err) {
            subscriber.error(err);
        }
    }, delay);
    subscriber.add(subscription);
    return subscription;
}
exports.caughtSchedule = caughtSchedule;
//# sourceMappingURL=caughtSchedule.js.map