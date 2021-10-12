import { ObservableInput, SubjectLike } from '../types';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
/**
 * An observable with a `connect` method that is used to create a subscription
 * to an underlying source, connecting it with all consumers via a multicast.
 */
export interface ConnectableObservableLike<T> extends Observable<T> {
    /**
     * (Idempotent) Calling this method will connect the underlying source observable to all subscribed consumers
     * through an underlying {@link Subject}.
     * @returns A subscription, that when unsubscribed, will "disconnect" the source from the connector subject,
     * severing notifications to all consumers.
     */
    connect(): Subscription;
}
export interface ConnectableConfig<T> {
    /**
     * A factory function used to create the Subject through which the source
     * is multicast. By default this creates a {@link Subject}.
     */
    connector: () => SubjectLike<T>;
    /**
     * If true, the resulting observable will reset internal state upon disconnetion
     * and return to a "cold" state. This allows the resulting observable to be
     * reconnected.
     * If false, upon disconnection, the connecting subject will remain the
     * connecting subject, meaning the resulting observable will not go "cold" again,
     * and subsequent repeats or resubscriptions will resubscribe to that same subject.
     */
    resetOnDisconnect?: boolean;
}
/**
 * Creates an observable that multicasts once `connect()` is called on it.
 *
 * @param source The observable source to make connectable.
 * @param config The configuration object for `connectable`.
 * @returns A "connectable" observable, that has a `connect()` method, that you must call to
 * connect the source to all consumers through the subject provided as the connector.
 */
export declare function connectable<T>(source: ObservableInput<T>, config?: ConnectableConfig<T>): ConnectableObservableLike<T>;
//# sourceMappingURL=connectable.d.ts.map