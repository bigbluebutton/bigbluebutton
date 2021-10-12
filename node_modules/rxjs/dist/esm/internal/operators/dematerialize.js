import { observeNotification } from '../Notification';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
export function dematerialize() {
    return operate((source, subscriber) => {
        source.subscribe(new OperatorSubscriber(subscriber, (notification) => observeNotification(notification, subscriber)));
    });
}
//# sourceMappingURL=dematerialize.js.map