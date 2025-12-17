/* eslint-disable no-undef */
// Rule applied because EventListener is not undefined at all times.
import React, { useEffect, useState } from 'react';
import { DataConsumptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/types';
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

import { ObjectToCustomSubscriptionHookContainerMap, SubscriptionHookWithArgumentsContainerProps, SubscriptionHookWithArgumentContainerToRender } from './domain/shared/custom-subscription/types';
import CurrentPresentationHookContainer from './domain/presentations/current-presentation/hook-manager';
import LoadedChatMessagesHookContainer from './domain/chat/loaded-chat-messages/hook-manager';
import TalkingIndicatorHookContainer from './domain/user-voice/talking-indicator/hook-manager';
import { GeneralHookManagerProps } from './types';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { User } from '/imports/ui/Types/user';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import MeetingHookContainer from './domain/meeting/from-core/hook-manager';
import { updateHookUsage } from './utils';
import { ObjectToCustomQueryHookContainerMap, QueryHookWithArgumentContainerToRender, QueryHookWithArgumentsContainerProps } from './domain/shared/custom-query/types';
import CustomQueryHookContainer from './domain/shared/custom-query/hook-manager';
import CustomDataConsumptionHooksErrorBoundary from './error-boundary/handler';
import UsersBasicInfoHookContainer from './domain/users/users-basic-info/hook-manager';
import { EssentialHookInformation } from './domain/shared/types';

const hooksMap:{
  [key: string]: React.FunctionComponent<GeneralHookManagerProps>
} = {
  [DataConsumptionHooks.TALKING_INDICATOR]: TalkingIndicatorHookContainer,
  [DataConsumptionHooks.LOADED_CHAT_MESSAGES]: LoadedChatMessagesHookContainer,
  [DataConsumptionHooks.LOADED_USER_LIST]: LoadedUserListHookContainer,
  [DataConsumptionHooks.CURRENT_USER]: CurrentUserHookContainer,
  [DataConsumptionHooks.CURRENT_PRESENTATION]: CurrentPresentationHookContainer,
  [DataConsumptionHooks.MEETING]: MeetingHookContainer,
  [DataConsumptionHooks.USERS_BASIC_INFO]: UsersBasicInfoHookContainer,
};

const SubscriptionHooksMapWithArguments: {
  [key: string]: React.FunctionComponent<SubscriptionHookWithArgumentsContainerProps>
} = {
  [DataConsumptionHooks.CUSTOM_SUBSCRIPTION]: CustomSubscriptionHookContainer,
};

const QueryHooksMapWithArguments: {
  [key: string]: React.FunctionComponent<QueryHookWithArgumentsContainerProps>
} = {
  [DataConsumptionHooks.CUSTOM_QUERY]: CustomQueryHookContainer,
};

const PluginDataConsumptionManager: React.FC = () => {
  const [
    hookInfo,
    setHookInfo,
  ] = useState(new Map<string, EssentialHookInformation>());

  const [
    subscriptionHookWithArgumentInfo,
    setSubscriptionHookWithArgumentInfo,
  ] = useState(new Map<string, Map<string, ObjectToCustomSubscriptionHookContainerMap>>());

  const [
    queryHookWithArgumentInfo,
    setQueryHookWithArgumentInfo,
  ] = useState(new Map<string, Map<string, ObjectToCustomQueryHookContainerMap>>());

  useEffect(() => {
    const subscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: DataConsumptionArguments | undefined;
        if (
          event.detail.hook === DataConsumptionHooks.CUSTOM_SUBSCRIPTION
          || event.detail.hook === DataConsumptionHooks.CUSTOM_QUERY
        ) {
          const detail = event.detail as SubscribedEventDetails;
          hookArguments = detail.hookArguments as DataConsumptionArguments;
        }
        updateHookUsage(
          setHookInfo,
          setSubscriptionHookWithArgumentInfo,
          setQueryHookWithArgumentInfo,
          event.detail.hook, 1, hookArguments,
        );
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        let hookArguments: DataConsumptionArguments | undefined;
        if (
          event.detail.hook === DataConsumptionHooks.CUSTOM_SUBSCRIPTION
          || event.detail.hook === DataConsumptionHooks.CUSTOM_QUERY
        ) {
          const detail = event.detail as SubscribedEventDetails;
          hookArguments = detail.hookArguments as DataConsumptionArguments;
        }
        updateHookUsage(
          setHookInfo,
          setSubscriptionHookWithArgumentInfo,
          setQueryHookWithArgumentInfo,
          event.detail.hook, -1, hookArguments,
        );
      }) as EventListener;

    window.addEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
    window.addEventListener(HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE, unsubscribeHandler);
    return () => {
      window.removeEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
      window.removeEventListener(HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE, unsubscribeHandler);
    };
  }, []);

  const SubscriptionHooksWithArgumentContainerToRun: SubscriptionHookWithArgumentContainerToRender[] = [];
  Object.keys(SubscriptionHooksMapWithArguments).forEach((hookName) => {
    if (subscriptionHookWithArgumentInfo.get(hookName)) {
      subscriptionHookWithArgumentInfo.get(hookName)?.forEach((object) => {
        if (object.count > 0) {
          SubscriptionHooksWithArgumentContainerToRun.push({
            componentToRender: SubscriptionHooksMapWithArguments[hookName],
            hookArguments: object.hookArguments,
            numberOfUses: object.count,
            version: object.version,
          });
        }
      });
    }
  });

  const QueryHooksWithArgumentContainerToRun: QueryHookWithArgumentContainerToRender[] = [];
  Object.keys(QueryHooksMapWithArguments).forEach((hookName) => {
    if (queryHookWithArgumentInfo.get(hookName)) {
      queryHookWithArgumentInfo.get(hookName)?.forEach((object) => {
        if (object.count > 0) {
          QueryHooksWithArgumentContainerToRun.push({
            componentToRender: QueryHooksMapWithArguments[hookName],
            hookArguments: object.hookArguments,
            version: object.version,
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
      cameras: currentUser.cameras,
      extId: currentUser.extId,
    }),
  );
  const meetingInformation = useMeeting((meeting) => ({
    name: meeting?.name,
    loginUrl: meeting?.loginUrl,
    meetingId: meeting?.meetingId,
  }));
  return (
    <>
      {
        Object.keys(hooksMap)
          .filter((hookName: string) => hookInfo.get(hookName)
            && hookInfo.get(hookName)!.count > 0)
          .map((hookName: string) => {
            let data;
            const HookComponent = hooksMap[hookName];
            if (hookName === DataConsumptionHooks.CURRENT_USER) data = currentUser;
            if (hookName === DataConsumptionHooks.MEETING) data = meetingInformation;
            const usage = hookInfo.get(hookName)!;
            return (
              <HookComponent
                numberOfUses={usage.count}
                key={`${hookName}-${usage.version}`}
                data={data}
              />
            );
          })
      }
      {
        SubscriptionHooksWithArgumentContainerToRun.map((hookWithArguments) => {
          const HookComponent = hookWithArguments.componentToRender;
          return (
            <CustomDataConsumptionHooksErrorBoundary
              key={`${makeCustomHookIdentifierFromArgs(hookWithArguments.hookArguments)}-${hookWithArguments.version}`}
              hookWithArguments={hookWithArguments}
              dataConsumptionHook={DataConsumptionHooks.CUSTOM_SUBSCRIPTION}
              setDataConsumptionHookWithArgumentUtilizationCount={setSubscriptionHookWithArgumentInfo}
            >
              <HookComponent
                key={
                  `${makeCustomHookIdentifierFromArgs(hookWithArguments.hookArguments)}-${hookWithArguments.version}`
                }
                numberOfUses={hookWithArguments.numberOfUses}
                hookArguments={hookWithArguments.hookArguments}
              />
            </CustomDataConsumptionHooksErrorBoundary>
          );
        })
      }
      {
        QueryHooksWithArgumentContainerToRun.map((hookWithArguments) => {
          const HookComponent = hookWithArguments.componentToRender;
          return (
            <CustomDataConsumptionHooksErrorBoundary
              key={`${makeCustomHookIdentifierFromArgs(hookWithArguments.hookArguments)}-${hookWithArguments.version}`}
              hookWithArguments={hookWithArguments}
              dataConsumptionHook={DataConsumptionHooks.CUSTOM_QUERY}
              setDataConsumptionHookWithArgumentUtilizationCount={setQueryHookWithArgumentInfo}
            >
              <HookComponent
                key={
                  `${makeCustomHookIdentifierFromArgs(hookWithArguments.hookArguments)}-${hookWithArguments.version}`
                }
                hookArguments={hookWithArguments.hookArguments}
                resolveQuery={() => {
                  updateHookUsage(() => {}, () => {}, setQueryHookWithArgumentInfo,
                    DataConsumptionHooks.CUSTOM_QUERY, -1, hookWithArguments.hookArguments);
                }}
              />
            </CustomDataConsumptionHooksErrorBoundary>
          );
        })
      }
    </>
  );
};

export default PluginDataConsumptionManager;
