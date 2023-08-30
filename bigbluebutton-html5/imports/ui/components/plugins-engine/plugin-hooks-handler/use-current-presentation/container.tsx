import { useEffect, useState } from 'react';
import { useCurrentPresentation } from '/imports/ui/core/hooks/useCurrentPresentation';
import { CurrentPresentation } from '/imports/ui/Types/presentation';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const projectCurrentPresentation = (
  currentPresentation: Partial<CurrentPresentation> | undefined,
): PluginSdk.CurrentPresentation | undefined => {
  let currentPresentationToPluginHookProjection: PluginSdk.CurrentPresentation | undefined;
  if (currentPresentation?.presentationId && currentPresentation?.pages) {
    const currentPage = currentPresentation.pages[0];
    currentPresentationToPluginHookProjection = {
      presentationId: currentPresentation.presentationId,
      currentPage: {
        id: currentPage.pageId,
        num: currentPage.num,
        urls: JSON.parse(currentPage.urls),
      },
    };
  }
  return currentPresentationToPluginHookProjection;
};

const CurrentPresentationHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);

  const currentPresentation = useCurrentPresentation(
    (currentPres: Partial<CurrentPresentation>) => currentPres,
  );

  const updatePresentationForPlugin = () => {
    const currentPresentationProjection:
      PluginSdk.CurrentPresentation | undefined = projectCurrentPresentation(currentPresentation);
    window.dispatchEvent(
      new CustomEvent(
        PluginSdk.Internal.BbbHookEvents.Update,
        {
          detail: {
            data: currentPresentationProjection,
            hook: PluginSdk.Internal.BbbHooks.UseCurrentPresentation,
          },
        },
      ),
    );
  };

  useEffect(() => {
    updatePresentationForPlugin();
  }, [currentPresentation, sendSignal]);

  useEffect(() => {
    const updateHookUseCurrentPresentation = () => {
      setSendSignal(!sendSignal);
    };
    window.addEventListener(
      PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseCurrentPresentation,
    );
    return () => {
      window.removeEventListener(
        PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseCurrentPresentation,
      );
    };
  }, []);

  return null;
};

export default CurrentPresentationHookContainer;
