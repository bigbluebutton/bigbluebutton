import { useEffect, useState, useContext } from 'react';
import { useSubscription } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { USERS_SUBSCRIPTION } from
  '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/queries';

const LoadedUserListHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);
  const { informationToLoadUserListData } = useContext(PluginsContext);
  const {
    offset,
    limit,
  } = informationToLoadUserListData;

  const { data: usersData } = useSubscription(USERS_SUBSCRIPTION, {
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
