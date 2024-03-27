import { useEffect, useState } from 'react';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { LayoutPresentatioAreaUiDataNames, UiLayouts } from 'bigbluebutton-html-plugin-sdk';
import { LayoutPresentationAreaUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/layout/presentation-area/types';

const useUpdatePresentationAreaContentForPlugin = (layoutContextState: Layout) => {
  const [presentationAreaContent, setPresentationAreaContent] = useState<LayoutPresentationAreaUiDataPayloads[
    LayoutPresentatioAreaUiDataNames.CURRENT_ELEMENT
  ]>();

  useEffect(() => {
    const { input } = layoutContextState;
    if (input.presentation.isOpen) {
      let currentElement = UiLayouts.ONLY_PRESENTATION;

      if (input.externalVideo.hasExternalVideo) {
        currentElement = UiLayouts.EXTERNAL_VIDEO;
      } else if (input.screenShare.hasScreenShare) {
        currentElement = UiLayouts.SCREEN_SHARE;
      } else if (input.sharedNotes.isPinned) {
        currentElement = UiLayouts.PINNED_SHARED_NOTES;
      } else if (input.genericComponent.genericComponentId) {
        currentElement = UiLayouts.GENERIC_COMPONENT;
      }
      setPresentationAreaContent({
        isOpen: true,
        currentElement,
      });
    } else if (presentationAreaContent?.isOpen) {
      setPresentationAreaContent({
        isOpen: input.presentation.isOpen || false,
        currentElement: undefined,
      });
    }
  }, [layoutContextState]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(LayoutPresentatioAreaUiDataNames.CURRENT_ELEMENT, {
      detail: presentationAreaContent,
    }));
  }, [presentationAreaContent]);
};

export default useUpdatePresentationAreaContentForPlugin;
