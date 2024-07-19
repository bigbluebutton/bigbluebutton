import { useEffect } from 'react';
import {
  PresentationAreaEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/presentation-area/enums';
import { layoutDispatch } from '../../../layout/context';
import { ACTIONS } from '../../../layout/enums';

const PluginPresentationAreaUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();

  const handlePresentationAreaOpen = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_IS_OPEN,
      value: true,
    });
  };

  const handlePresentationAreaClose = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_IS_OPEN,
      value: false,
    });
  };

  useEffect(() => {
    window.addEventListener(PresentationAreaEnum.OPEN, handlePresentationAreaOpen);
    window.addEventListener(PresentationAreaEnum.CLOSE, handlePresentationAreaClose);

    return () => {
      window.addEventListener(PresentationAreaEnum.OPEN, handlePresentationAreaOpen);
      window.addEventListener(PresentationAreaEnum.OPEN, handlePresentationAreaClose);
    };
  }, []);
  return null;
};

export default PluginPresentationAreaUiCommandsHandler;
