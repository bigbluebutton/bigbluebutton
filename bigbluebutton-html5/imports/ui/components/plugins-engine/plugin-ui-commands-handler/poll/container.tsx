import { useEffect } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { Session } from 'meteor/session';
import { layoutDispatch } from '../../../layout/context';
import { PANELS, ACTIONS } from '../../../layout/enums';

const PluginPollUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();

  const handlePollFormsOpen = () => {
    if (Session.equals('pollInitiated', true)) {
      Session.set('resetPollPanel', true);
    }
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.POLL,
    });
    Session.set('forcePollOpen', true);
  };

  useEffect(() => {
    window.addEventListener(PluginSdk.Internal.UiCommandsEvents.Poll.Open, handlePollFormsOpen);

    return () => {
      window.addEventListener(PluginSdk.Internal.UiCommandsEvents.Poll.Open, handlePollFormsOpen);
    };
  }, []);
  return null;
};

export default PluginPollUiCommandsHandler;
