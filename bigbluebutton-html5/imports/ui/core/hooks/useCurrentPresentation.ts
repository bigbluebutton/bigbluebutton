import { createUseSubscription } from "./createUseSubscription";
import { CURRENT_PRESENTATION_SUBSCRIPTION } from "../graphql/queries/currentPresentationSubscription";
import { Presentation } from "../../Types/presentation";


const useCurrentPresentationSubscription = createUseSubscription<Partial<Presentation>>(CURRENT_PRESENTATION_SUBSCRIPTION, false);

export const useCurrentPresentation = (fn: (c: Partial<Presentation>)=> Partial<Presentation>)=>{
  const currentPresentation = useCurrentPresentationSubscription(fn)[0];
  return currentPresentation;
};
