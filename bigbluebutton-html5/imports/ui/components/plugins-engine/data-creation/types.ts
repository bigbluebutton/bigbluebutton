export interface MutationSubscriptionCountObject {
  count: number;
  mutation: string;
  options?: object;
}

export interface MutationSubscriptionObject {
  [key: string]: MutationSubscriptionCountObject
}
