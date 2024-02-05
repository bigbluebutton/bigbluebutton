import { useEffect } from 'react';
import {
    LayoutCommandsEnum, LayoutComponentListEnum
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/layout/enums';
import { layoutDispatch } from '../../../layout/context';
import { ACTIONS } from '../../../layout/enums';
import { Session } from 'meteor/session';

const PluginLayoutUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();

  const handleLayoutSet = ((event: CustomEvent<LayoutComponentListEnum>) => {
    const layout = event.detail;
    switch (layout) {
        case LayoutComponentListEnum.GENERIC_COMPONENT:
            layoutContextDispatch({
                type: ACTIONS.SET_HAS_GENERIC_COMPONENT,
                value: true,
            });
            layoutContextDispatch({
                type: ACTIONS.SET_PRESENTATION_IS_OPEN,
                value: true,
              });
            break;
        default:
            break;
    }
  }) as EventListener;
  
  const handleLayoutUnset = ((event: CustomEvent<LayoutComponentListEnum>) => {
    const layout = event.detail;
    switch (layout) {
        case LayoutComponentListEnum.GENERIC_COMPONENT:
            layoutContextDispatch({
                type: ACTIONS.SET_HAS_GENERIC_COMPONENT,
                value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_PRESENTATION_IS_OPEN,
              value: Session.get('presentationLastState'),
            });
            break;
        default:
            break;
    }
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(LayoutCommandsEnum.SET, handleLayoutSet);
    window.addEventListener(LayoutCommandsEnum.UNSET, handleLayoutUnset);

    return () => {
      window.addEventListener(LayoutCommandsEnum.SET, handleLayoutSet);
      window.addEventListener(LayoutCommandsEnum.UNSET, handleLayoutUnset);
    };
  }, []);
  return null;
};

export default PluginLayoutUiCommandsHandler;
