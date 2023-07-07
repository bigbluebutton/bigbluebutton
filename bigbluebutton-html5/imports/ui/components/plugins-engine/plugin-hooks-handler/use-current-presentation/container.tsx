import { useEffect, useState } from 'react';
import { useCurrentPresentation } from '/imports/ui/core/hooks/useCurrentPresentation';
import { Presentation } from '/imports/ui/Types/presentation';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const handleProjectCurrentPresentation: (currentPresentation: Partial<Presentation> | undefined) => PluginSdk.CurrentPresentation | undefined = (currentPresentation: Partial<Presentation> | undefined) => {
  let presPageData: PluginSdk.CurrentPresentation | undefined;

  if ( currentPresentation?.isCurrentPage && currentPresentation?.num
    && currentPresentation?.pageId && currentPresentation?.presentation?.presentationId
    && currentPresentation?.slideRevealed && currentPresentation?.urls  
  ) {
    presPageData = {
      isCurrentPage: currentPresentation.isCurrentPage,
      num: currentPresentation.num,
      pageId: currentPresentation.pageId,
      presentationId: currentPresentation.presentation?.presentationId,
      slideRevealed: currentPresentation.slideRevealed,
      urls: JSON.parse(currentPresentation.urls),
    };
  }
  return presPageData;
}

const CurrentPresentationHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);

  const currentPresentation = useCurrentPresentation((currentPres: Partial<Presentation>) => {
    return {
      isCurrentPage: currentPres.isCurrentPage,
      num: currentPres.num,
      pageId: currentPres.pageId,
      presentation: {
        presentationId: currentPres.presentation?.presentationId,
      },
      slideRevealed: currentPres.slideRevealed,
      urls: currentPres.urls,
    } as Partial<Presentation>
  });

  const updatePresentationForPlugin = () => {
    const presPageData: PluginSdk.CurrentPresentation | undefined = handleProjectCurrentPresentation(currentPresentation);
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
    window.addEventListener(PluginSdk.Internal.BbbHookEvents.NewSubscriber, updateHookUseCurrentPresentation);
    return () => {
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.NewSubscriber, updateHookUseCurrentPresentation);
    }
  }, []);

  return null;
};

export default CurrentPresentationHookContainer;
