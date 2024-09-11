import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { SubscribedEventDetails, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import formatLoadedUserListDataFromGraphql from './utils';
import { useLocalUserList } from '/imports/ui/core/hooks/useLoadedUserList';

const LoadedUserListHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);
  const [usersData] = useLocalUserList((user: Partial<User>) => ({
    userId: user.userId,
    name: user.name,
    role: user.role,
  }));

  const updateLoadedUserListForPlugin = () => {
    window.dispatchEvent(new CustomEvent<
      UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.LoadedUserListData>>
    >(HookEvents.BBB_CORE_SENT_NEW_DATA, {
      detail: {
        data: formatLoadedUserListDataFromGraphql(usersData),
        hook: DataConsumptionHooks.LOADED_USER_LIST,
      },
    }));
  };

  useEffect(() => {
    updateLoadedUserListForPlugin();
  }, [usersData, sendSignal]);

  useEffect(() => {
    const updateHookUseLoadedUserList = ((event: CustomEvent<SubscribedEventDetails>) => {
      if (event.detail.hook === DataConsumptionHooks.LOADED_USER_LIST) setSendSignal((signal) => !signal);
    }) as EventListener;
    window.addEventListener(
      HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseLoadedUserList,
    );
    return () => {
      window.removeEventListener(
        HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseLoadedUserList,
      );
    };
  }, []);

  return null;
};

export default LoadedUserListHookContainer;
