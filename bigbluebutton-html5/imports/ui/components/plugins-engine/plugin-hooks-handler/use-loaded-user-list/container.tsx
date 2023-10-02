import { useEffect, useState, useContext } from 'react';
import { useSubscription } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { USER_LIST_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';

const LoadedUserListHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);
  const { userListGraphqlVariables } = useContext(PluginsContext);
  const {
    offset,
    limit,
  } = userListGraphqlVariables;

  const { data: usersData } = useSubscription(USER_LIST_SUBSCRIPTION, {
    variables: {
      offset,
      limit,
    },
  });

  const updateLoadedUserListForPlugin = () => {
    window.dispatchEvent(new CustomEvent(PluginSdk.Internal.BbbHookEvents.Update, {
      detail: {
        data: usersData?.user,
        hook: PluginSdk.Internal.BbbHooks.UseLoadedUserList,
      },
    }));
  };

  useEffect(() => {
    updateLoadedUserListForPlugin();
  }, [usersData, sendSignal]);

  useEffect(() => {
    const updateHookUseLoadedUserList = () => {
      setSendSignal(!sendSignal);
    };
    window.addEventListener(
      PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseLoadedUserList,
    );
    return () => {
      window.removeEventListener(
        PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseLoadedUserList,
      );
    };
  }, []);

  return null;
};

export default LoadedUserListHookContainer;
