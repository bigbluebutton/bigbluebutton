import { Observable } from '../Observable';
import { ObservableInput, SchedulerLike, ObservedValueOf } from '../types';
export declare function from<O extends ObservableInput<any>>(input: O): Observable<ObservedValueOf<O>>;
/** @deprecated The `scheduler` parameter will be removed in v8. Use `scheduled`. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function from<O extends ObservableInput<any>>(input: O, scheduler: SchedulerLike): Observable<ObservedValueOf<O>>;
export declare function innerFrom<T>(input: ObservableInput<T>): Observable<T>;
/**
 * Synchronously emits the values of an array like and completes.
 * This is exported because there are creation functions and operators that need to
 * make direct use of the same logic, and there's no reason to make them run through
 * `from` conditionals because we *know* they're dealing with an array.
 * @param array The array to emit values from
 */
export declare function fromArrayLike<T>(array: ArrayLike<T>): Observable<T>;
//# sourceMappingURL=from.d.ts.map