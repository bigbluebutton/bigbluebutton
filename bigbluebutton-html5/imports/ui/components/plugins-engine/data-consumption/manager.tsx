/* eslint-disable no-undef */
// Rule applied because EventListener is not undefined at all times.
import React, { useEffect, useState } from 'react';
import { CustomSubscriptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-subscription/types';
import { makeCustomHookIdentifierFromArgs } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/utils';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import {
  DataConsumptionHooks,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { HookEventWrapper, SubscribedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import LoadedUserListHookContainer from './domain/users/loaded-user-list/hook-manager';
import CurrentUserHookContainer from './domain/users/current-user/hook-manager';
import CustomSubscriptionHookContainer from './domain/shared/custom-subscription/hook-manager';

import { ObjectToCustomHookContainerMap, HookWithArgumentsContainerProps, HookWithArgumentContainerToRender } from './domain/shared/custom-subscription/types';
import CurrentPresentationHookContainer from './domain/presentations/current-presentation/hook-manager';
import LoadedChatMessagesHookContainer from './domain/chat/loaded-chat-messages/hook-manager';
import TalkingIndicatorHookContainer from './domain/user-voice/talking-indicator/hook-manager';
import { GeneralHookManagerProps } from './types';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { User } from '/imports/ui/Types/user';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';
import MeetingHookContainer from './domain/meeting/from-core/hook-manager';

const hooksMap:{
  [key: string]: React.FunctionComponent<GeneralHookManagerProps>
} = {
  [DataConsumptionHooks.TALKING_INDICATOR]: TalkingIndicatorHookContainer,
  [DataConsumptionHooks.LOADED_CHAT_MESSAGES]: LoadedChatMessagesHookContainer,
  [DataConsumptionHooks.LOADED_USER_LIST]: LoadedUserListHookContainer,
  [DataConsumptionHooks.CURRENT_USER]: CurrentUserHookContainer,
  [DataConsumptionHooks.CURRENT_PRESENTATION]: CurrentPresentationHookContainer,
  [DataConsumptionHooks.MEETING]: MeetingHookContainer,
};

const HooksMapWithArguments:{
  [key: string]: React.FunctionComponent<HookWithArgumentsContainerProps>
} = {
  [DataConsumptionHooks.CUSTOM_SUBSCRIPTION]: CustomSubscriptionHookContainer,
};

const PluginDataConsumptionManager: React.FC = () => {
  const [
    hookUtilizationCount,
    setHookUtilizationCount,
  ] = useState(new Map<string, number>());

  const [
    hookWithArgumentUtilizationCount,
    setHookWithArgumentUtilizationCount,
  ] = useState(new Map<string, Map<string, ObjectToCustomHookContainerMap>>());

  useEffect(() => {
    const updateHookUsage = (
      hookName: string, delta: number, hookArguments?: CustomSubscriptionArguments,
    ): void => {
      if (hookName !== DataConsumptionHooks.CUSTOM_SUBSCRIPTION) {
        setHookUtilizationCount((mapObj) => {
          const newMap = new Map<string, number>(mapObj.entries());
          newMap.set(hookName, (mapObj.get(hookName) || 0) + delta);
          return newMap;
        });
      } else {
        setHookWithArgumentUtilizationCount((mapObj) => {
          if (hookArguments) {
            const hookArgumentsAsKey = makeCustomHookIdentifierFromArgs(hookArguments);
            // Create object from the hook with argument
            const mapToBeSet = new Map<string, ObjectToCustomHookContainerMap>(mapObj.get(hookName)?.entries());
            mapToBeSet.set(hookArgumentsAsKey, {
              count: (mapObj.get(hookName)?.get(hookArgumentsAsKey)?.count || 0) + delta,
              hookArguments,
            } as ObjectToCustomHookContainerMap);

            // Create new map with argument
            const newMap = new Map<string, Map<string, ObjectToCustomHookContainerMap>>(mapObj.entries());
            newMap.set(hookName, mapToBeSet);
            return newMap;
          } return mapObj;
        });
      }
    };

    const subscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: CustomSubscriptionArguments | undefined;
        if (event.detail.hook === DataConsumptionHooks.CUSTOM_SUBSCRIPTION) {
          const detail = event.detail as SubscribedEventDetails;
          hookArguments = detail.hookArguments as CustomSubscriptionArguments;
        }
        updateHookUsage(event.detail.hook, 1, hookArguments);
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: CustomSubscriptionArguments | undefined;
        if (event.detail.hook === DataConsumptionHooks.CUSTOM_SUBSCRIPTION) {
          const detail = event.detail as SubscribedEventDetails;
          hookArguments = detail.hookArguments as CustomSubscriptionArguments;
        }
        updateHookUsage(event.detail.hook, -1, hookArguments);
      }) as EventListener;

    window.addEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
    window.addEventListener(HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE, unsubscribeHandler);
    return () => {
      window.removeEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
      window.removeEventListener(HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE, unsubscribeHandler);
    };
  }, []);

  const HooksWithArgumentContainerToRun: HookWithArgumentContainerToRender[] = [];
  Object.keys(HooksMapWithArguments).forEach((hookName) => {
    if (hookWithArgumentUtilizationCount.get(hookName)) {
      hookWithArgumentUtilizationCount.get(hookName)?.forEach((object) => {
        if (object.count > 0) {
          HooksWithArgumentContainerToRun.push({
            componentToRender: HooksMapWithArguments[hookName],
            hookArguments: object.hookArguments,
          });
        }
      });
    }
  });

  // Use the subscription hook here to avoid new unecessary subscription for graphql
  const currentUser = useCurrentUser(
    (currentUser: Partial<User>) => ({
      userId: currentUser.userId,
      name: currentUser.name,
      role: currentUser.role,
      presenter: currentUser.presenter,
    }),
  );
  const meetingInformation = useMeeting((meeting: Partial<Meeting>) => ({
    name: meeting?.name,
    loginUrl: meeting?.loginUrl,
    meetingId: meeting?.meetingId,
  }));
  return (
    <>
      {
        Object.keys(hooksMap)
          .filter((hookName: string) => hookUtilizationCount.get(hookName)
            && hookUtilizationCount.get(hookName)! > 0)
          .map((hookName: string) => {
            let data;
            const HookComponent = hooksMap[hookName];
            if (hookName === DataConsumptionHooks.CURRENT_USER) data = currentUser;
            if (hookName === DataConsumptionHooks.MEETING) data = meetingInformation;
            return (
              <HookComponent
                key={hookName}
                data={data}
              />
            );
          })
      }
      {
        HooksWithArgumentContainerToRun.map((hookWithArguments) => {
          const HookComponent = hookWithArguments.componentToRender;
          return (
            <HookComponent
              key={makeCustomHookIdentifierFromArgs(hookWithArguments.hookArguments)}
              hookArguments={hookWithArguments.hookArguments}
            />
          );
        })
      }
    </>
  );
};

export default PluginDataConsumptionManager;
