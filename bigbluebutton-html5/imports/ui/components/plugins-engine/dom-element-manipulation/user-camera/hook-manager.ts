import {
  useContext,
  useEffect,
  useState,
} from 'react';
import { HookEventWrapper, SubscribedEventDetails, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DomElementManipulationHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/enums';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { UserCameraDomElementsArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';
import { StreamIdNeededForPlugin } from './types';
import { PluginsContextType } from '../../../components-data/plugin-context/types';

const UserCameraDomElementManipulationHookManager = () => {
  const {
    setDomElementManipulationIdentifiers,
  } = useContext<PluginsContextType>(PluginsContext);

  const [neededStreamIdsForPlugin, setNeededStreamIdsForPlugin] = useState<StreamIdNeededForPlugin>({});

  useEffect(() => {
    const subscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: UserCameraDomElementsArguments;
        if (event.detail.hook === DomElementManipulationHooks.USER_CAMERA) {
          const detail = event.detail as SubscribedEventDetails;
          hookArguments = detail.hookArguments as UserCameraDomElementsArguments;
          setNeededStreamIdsForPlugin((lastState) => {
            const newState = { ...lastState };
            newState[hookArguments.pluginUuid] = hookArguments.streamIds;
            return newState;
          });
        }
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: UserCameraDomElementsArguments;
        if (event.detail.hook === DomElementManipulationHooks.USER_CAMERA) {
          const detail = event.detail as SubscribedEventDetails;
          hookArguments = detail.hookArguments as UserCameraDomElementsArguments;
          setNeededStreamIdsForPlugin((lastState) => {
            const newState = { ...lastState };
            if (Object.keys(newState).includes(hookArguments.pluginUuid)) delete newState[hookArguments.pluginUuid];
            return newState;
          });
        }
      }) as EventListener;
    const updateSdkDependenciesHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: UserCameraDomElementsArguments;
        if (event.detail.hook === DomElementManipulationHooks.USER_CAMERA) {
          const detail = event.detail as UpdatedEventDetails<void>;
          hookArguments = detail.hookArguments as UserCameraDomElementsArguments;
          setNeededStreamIdsForPlugin((lastState) => {
            const newState = { ...lastState };
            newState[hookArguments.pluginUuid] = hookArguments.streamIds;
            return newState;
          });
        }
      }) as EventListener;

    window.addEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
    window.addEventListener(HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE, unsubscribeHandler);
    window.addEventListener(HookEvents.PLUGIN_SENT_CHANGES_TO_BBB_CORE, updateSdkDependenciesHandler);
    return () => {
      window.removeEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
      window.removeEventListener(HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE, unsubscribeHandler);
      window.removeEventListener(HookEvents.PLUGIN_SENT_CHANGES_TO_BBB_CORE, updateSdkDependenciesHandler);
    };
  }, []);

  useEffect(() => {
    const streamIds = [...new Set(Object.values(neededStreamIdsForPlugin).flat())];
    setDomElementManipulationIdentifiers((previousState) => {
      const newState = { ...previousState };
      newState.USER_CAMERA = streamIds;
      return newState;
    });
  }, [neededStreamIdsForPlugin]);

  return null;
};

export default UserCameraDomElementManipulationHookManager;
