import { useContext, useEffect } from 'react';
import { HookEventWrapper, SubscribedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DomElementManipulationHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/enums';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { UserCameraDomElementsArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';

const UserCameraDomElementManipulationHookManager = () => {
  const {
    setDomElementManipulationStreamIds,
  } = useContext(PluginsContext);

  useEffect(() => {
    const subscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: UserCameraDomElementsArguments | undefined;
        if (event.detail.hook === DomElementManipulationHooks.USER_CAMERA) {
          const detail = event.detail as SubscribedEventDetails;
          hookArguments = detail.hookArguments as UserCameraDomElementsArguments;
          setDomElementManipulationStreamIds(hookArguments.streamIds);
        }
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: UserCameraDomElementsArguments | undefined;
        if (event.detail.hook === DomElementManipulationHooks.USER_CAMERA) {
          const detail = event.detail as SubscribedEventDetails;
          hookArguments = detail.hookArguments as UserCameraDomElementsArguments;
          setDomElementManipulationStreamIds(hookArguments.streamIds);
        }
      }) as EventListener;

    window.addEventListener(HookEvents.SUBSCRIBED, subscribeHandler);
    window.addEventListener(HookEvents.UNSUBSCRIBED, unsubscribeHandler);
    return () => {
      window.removeEventListener(HookEvents.SUBSCRIBED, subscribeHandler);
      window.removeEventListener(HookEvents.UNSUBSCRIBED, unsubscribeHandler);
    };
  }, []);
  return null;
};

export default UserCameraDomElementManipulationHookManager;
