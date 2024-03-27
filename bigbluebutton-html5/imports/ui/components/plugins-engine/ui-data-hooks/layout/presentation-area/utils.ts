import { useEffect, useState } from 'react';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { LayoutPresentatioAreaUiDataNames, UiLayouts } from 'bigbluebutton-html-plugin-sdk';
import { LayoutPresentationAreaUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/layout/presentation-area/types';
import { PRESENTATION_AREA } from '/imports/ui/components/layout/enums';

const useUpdatePresentationAreaContentForPluginForPlugin = (layoutContextState: Layout) => {
  const [presentationAreaContent, setPresentationAreaContent] = useState<LayoutPresentationAreaUiDataPayloads[
    LayoutPresentatioAreaUiDataNames.CURRENT_ELEMENT
  ]>();
  const { presentationAreaContentActions: presentationAreaContentPile } = layoutContextState;

  useEffect(() => {
    setPresentationAreaContent(presentationAreaContentPile.map((p) => {
      let currentElement;
      let genericComponentId;
      switch (p.value.content) {
        case PRESENTATION_AREA.PINNED_NOTES:
          currentElement = UiLayouts.PINNED_SHARED_NOTES;
          break;
        case PRESENTATION_AREA.EXTERNAL_VIDEO:
          currentElement = UiLayouts.EXTERNAL_VIDEO;
          break;
        case PRESENTATION_AREA.GENERIC_COMPONENT:
          currentElement = UiLayouts.GENERIC_COMPONENT;
          genericComponentId = p.value.genericComponentId;
          break;
        case PRESENTATION_AREA.SCREEN_SHARE:
          currentElement = UiLayouts.SCREEN_SHARE;
          break;
        default:
          currentElement = UiLayouts.WHITEBOARD;
          break;
      }
      return {
        isOpen: p.value.open,
        currentElement,
        genericComponentId,
      };
    }));
  }, [layoutContextState]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(LayoutPresentatioAreaUiDataNames.CURRENT_ELEMENT, {
      detail: presentationAreaContent,
    }));
  }, [presentationAreaContent]);
};

export default useUpdatePresentationAreaContentForPluginForPlugin;
