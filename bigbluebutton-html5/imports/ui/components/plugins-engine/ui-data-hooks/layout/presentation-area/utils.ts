import { useEffect, useState } from 'react';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { LayoutPresentatioAreaUiDataNames, UiLayouts } from 'bigbluebutton-html-plugin-sdk';
import { LayoutPresentationAreaUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/layout/presentation-area/types';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/consts';
import { PRESENTATION_AREA } from '/imports/ui/components/layout/enums';

const useUpdatePresentationAreaContentForPluginForPlugin = (layoutContextState: Layout) => {
  const [presentationAreaContent, setPresentationAreaContent] = useState<LayoutPresentationAreaUiDataPayloads[
    LayoutPresentatioAreaUiDataNames.CURRENT_ELEMENT
  ]>();
  const { presentationAreaContentActions: presentationAreaContentPile } = layoutContextState;

  const generateNewContentInfo = () => {
    return presentationAreaContentPile.map((p) => {
      let currentElement;
      let genericContentId;
      switch (p.value.content) {
        case PRESENTATION_AREA.PINNED_NOTES:
          currentElement = UiLayouts.PINNED_SHARED_NOTES;
          break;
        case PRESENTATION_AREA.EXTERNAL_VIDEO:
          currentElement = UiLayouts.EXTERNAL_VIDEO;
          break;
        case PRESENTATION_AREA.GENERIC_CONTENT:
          currentElement = UiLayouts.GENERIC_CONTENT;
          genericContentId = p.value.genericContentId;
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
        genericContentId,
      };
    });
  };

  // Define function to first inform ui data hooks that subscribe to this event
  const updateUiDataHookLayoutPresentatioAreaChangedForPlugin = () => {
    const content = presentationAreaContent || generateNewContentInfo();
    window.dispatchEvent(new CustomEvent(LayoutPresentatioAreaUiDataNames.CURRENT_ELEMENT, {
      detail: content,
    }));
  };

  useEffect(() => {
    // When component mount, add event listener to send first information
    // about this ui data hooks to plugin
    window.addEventListener(
      `${UI_DATA_LISTENER_SUBSCRIBED}-${LayoutPresentatioAreaUiDataNames.CURRENT_ELEMENT}`,
      updateUiDataHookLayoutPresentatioAreaChangedForPlugin,
    );

    // Before component unmount, remove event listeners for plugin ui data hooks
    return () => {
      window.removeEventListener(
        `${UI_DATA_LISTENER_SUBSCRIBED}-${LayoutPresentatioAreaUiDataNames.CURRENT_ELEMENT}`,
        updateUiDataHookLayoutPresentatioAreaChangedForPlugin,
      );
    };
  }, []);

  useEffect(() => {
    setPresentationAreaContent(generateNewContentInfo());
  }, [layoutContextState]);

  useEffect(() => {
    updateUiDataHookLayoutPresentatioAreaChangedForPlugin();
  }, [presentationAreaContent]);
};

export default useUpdatePresentationAreaContentForPluginForPlugin;
