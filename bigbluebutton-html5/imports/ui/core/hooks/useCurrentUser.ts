import { createUseSubsciption } from "./createUseSubscription";
import { CURRENT_USER_SUBSCRIPTION } from "../graphql/queries/currentUserSubscription";
import { User } from "../../Types/user";


const useCurrentUserSubscription = createUseSubsciption<Partial<User>>(CURRENT_USER_SUBSCRIPTION, false);

export const useCurrentUser = (fn: (c: Partial<User>)=> Array<Partial<User>>)=>{
  const currentUser = useCurrentUserSubscription(fn)[0];
  return currentUser;
};