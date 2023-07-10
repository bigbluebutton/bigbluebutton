import { createUseSubscription } from "./createUseSubscription";
import { CURRENT_USER_SUBSCRIPTION } from "../graphql/queries/currentUserSubscription";
import { User } from "../../Types/user";


const useCurrentUserSubscription = createUseSubscription<Partial<User>>(CURRENT_USER_SUBSCRIPTION, false);

export const useCurrentUser = (fn: (c: Partial<User>) => Partial<User>) => {
  const currentUser = useCurrentUserSubscription(fn)[0];
  return currentUser;
};
