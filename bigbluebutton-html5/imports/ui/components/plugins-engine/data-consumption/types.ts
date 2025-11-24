import { ObjectToCustomQueryHookContainerMap } from './domain/shared/custom-query/types';
import { ObjectToCustomSubscriptionHookContainerMap } from './domain/shared/custom-subscription/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GeneralHookManagerProps<T = any> {
    data: T;
    numberOfUses: number;
}

export type ObjectToCustomHookContainerMap =
    ObjectToCustomQueryHookContainerMap | ObjectToCustomSubscriptionHookContainerMap;
