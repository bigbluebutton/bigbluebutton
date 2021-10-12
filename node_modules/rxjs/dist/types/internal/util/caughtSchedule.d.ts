import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { SchedulerAction, SchedulerLike } from '../types';
export declare function caughtSchedule(subscriber: Subscriber<any>, scheduler: SchedulerLike, execute: (this: SchedulerAction<any>) => void, delay?: number): Subscription;
//# sourceMappingURL=caughtSchedule.d.ts.map