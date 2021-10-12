import { isFunction } from '../util/isFunction';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { identity } from '../util/identity';
export function tap(observerOrNext, error, complete) {
    const tapObserver = isFunction(observerOrNext) || error || complete ? { next: observerOrNext, error, complete } : observerOrNext;
    return tapObserver
        ? operate((source, subscriber) => {
            source.subscribe(new OperatorSubscriber(subscriber, (value) => {
                var _a;
                (_a = tapObserver.next) === null || _a === void 0 ? void 0 : _a.call(tapObserver, value);
                subscriber.next(value);
            }, () => {
                var _a;
                (_a = tapObserver.complete) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                subscriber.complete();
            }, (err) => {
                var _a;
                (_a = tapObserver.error) === null || _a === void 0 ? void 0 : _a.call(tapObserver, err);
                subscriber.error(err);
            }));
        })
        :
            identity;
}
//# sourceMappingURL=tap.js.map