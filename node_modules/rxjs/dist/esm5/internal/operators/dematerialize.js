import { observeNotification } from '../Notification';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function dematerialize() {
    return operate(function (source, subscriber) {
        source.subscribe(new OperatorSubscriber(subscriber, function (notification) { return observeNotification(notification, subscriber); }));
    });
}
//# sourceMappingURL=dematerialize.js.map