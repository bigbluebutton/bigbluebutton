import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../types';
/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`. If the source Observable
 * calls `error`, this method will emit the Throwable that caused the error to the Observable returned from `notifier`.
 * If that Observable calls `complete` or `error` then this method will call `complete` or `error` on the child
 * subscription. Otherwise this method will resubscribe to the source Observable.
 *
 * ![](retryWhen.png)
 *
 * Retry an observable sequence on error based on custom criteria.
 *
 * ## Example
 * ```ts
 * import { timer, interval } from 'rxjs';
 * import { map, tap, retryWhen, delayWhen } from 'rxjs/operators';
 *
 * const source = interval(1000);
 * const example = source.pipe(
 *   map(val => {
 *     if (val > 5) {
 *       // error will be picked up by retryWhen
 *       throw val;
 *     }
 *     return val;
 *   }),
 *   retryWhen(errors =>
 *     errors.pipe(
 *       // log error message
 *       tap(val => console.log(`Value ${val} was too high!`)),
 *       // restart in 5 seconds
 *       delayWhen(val => timer(val * 1000))
 *     )
 *   )
 * );
 *
 * const subscribe = example.subscribe(val => console.log(val));
 *
 * // results:
 * //   0
 * //   1
 * //   2
 * //   3
 * //   4
 * //   5
 * //   "Value 6 was too high!"
 * //  --Wait 5 seconds then repeat
 * ```
 *
 * @param {function(errors: Observable): Observable} notifier - Receives an Observable of notifications with which a
 * user can `complete` or `error`, aborting the retry.
 * @return A function that returns an Observable that mirrors the source
 * Observable with the exception of an `error`.
 */
export declare function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T>;
//# sourceMappingURL=retryWhen.d.ts.map