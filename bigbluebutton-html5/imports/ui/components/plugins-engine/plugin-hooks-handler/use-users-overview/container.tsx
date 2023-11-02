import { useEffect, useState } from 'react';
import { useSubscription } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { USERS_OVERVIEW } from '/imports/ui/core/graphql/queries/users';

const UsersOverviewHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);

  const { data: usersData } = useSubscription(USERS_OVERVIEW);

  const updateUsersOverviewForPlugin = () => {
    window.dispatchEvent(new CustomEvent(PluginSdk.Internal.BbbHookEvents.Update, {
      detail: {
        data: usersData?.user,
        hook: PluginSdk.Internal.BbbHooks.UseUsersOverview,
      },
    }));
  };

  useEffect(() => {
    updateUsersOverviewForPlugin();
  }, [usersData, sendSignal]);

  useEffect(() => {
    const updateHookUseUsersOverview = () => {
      setSendSignal(!sendSignal);
    };
    window.addEventListener(
      PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseUsersOverview,
    );
    return () => {
      window.removeEventListener(
        PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseUsersOverview,
      );
    };
  }, []);

  return null;
};

export default UsersOverviewHookContainer;
