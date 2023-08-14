import { createUseSubscription } from "./createUseSubscription";
import { CURRENT_PRESENTATION_SUBSCRIPTION_FOR_PLUGIN_HOOK } from "../graphql/queries/currentPresentationSubscription";
import { CurrentPresentationForPluginHook } from "../../Types/presentation";


const useCurrentPresentationSubscription = createUseSubscription<Partial<CurrentPresentationForPluginHook>>(CURRENT_PRESENTATION_SUBSCRIPTION_FOR_PLUGIN_HOOK, false);

export const useCurrentPresentation = (fn: (c: Partial<CurrentPresentationForPluginHook>)=> Partial<CurrentPresentationForPluginHook>)=>{
  const currentPresentation = useCurrentPresentationSubscription(fn)[0];
  return currentPresentation;
};
