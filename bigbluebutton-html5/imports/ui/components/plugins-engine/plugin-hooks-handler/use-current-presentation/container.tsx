import { useEffect, useState } from 'react';
import { useCurrentPresentation } from '/imports/ui/core/hooks/useCurrentPresentation';
import { CurrentPresentationForPluginHook } from '/imports/ui/Types/presentation';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const projectCurrentPresentation: (currentPresentation: Partial<CurrentPresentationForPluginHook> | undefined) => PluginSdk.Presentation | undefined = (currentPresentation: Partial<CurrentPresentationForPluginHook> | undefined) => {
  let presPageData: PluginSdk.Presentation | undefined;

  if ( currentPresentation?.num && currentPresentation?.urls 
    && currentPresentation?.pageId && currentPresentation?.presentation?.presentationId 
  ) {
    presPageData = {
      presentationId: currentPresentation.presentation?.presentationId,
      currentPage: {
        id: currentPresentation.pageId,
        num: currentPresentation.num,
        urls: JSON.parse(currentPresentation.urls),
      }
    };
  }
  return presPageData;
}

const CurrentPresentationHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);

  const currentPresentation = useCurrentPresentation((currentPres: Partial<CurrentPresentationForPluginHook>) => {
    return {
      num: currentPres.num,
      pageId: currentPres.pageId,
      presentation: {
        presentationId: currentPres.presentation?.presentationId,
      },
      urls: currentPres.urls,
    } as Partial<CurrentPresentationForPluginHook>
  });

  const updatePresentationForPlugin = () => {
    const presPageData: PluginSdk.Presentation | undefined = projectCurrentPresentation(currentPresentation);
    window.dispatchEvent(new CustomEvent(PluginSdk.Internal.BbbHookEvents.Update, { detail: { data: presPageData, 
      hook: PluginSdk.Internal.BbbHooks.UseCurrentPresentation } }));
  };

  useEffect(() => {
    updatePresentationForPlugin();
  }, [currentPresentation, sendSignal]);

  
  useEffect(() => {
    const updateHookUseCurrentPresentation = () => {
      setSendSignal(!sendSignal);
    }
    window.addEventListener(PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseCurrentPresentation);
    return () => {
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseCurrentPresentation);
    }
  }, []);

  return null;
};

export default CurrentPresentationHookContainer;
