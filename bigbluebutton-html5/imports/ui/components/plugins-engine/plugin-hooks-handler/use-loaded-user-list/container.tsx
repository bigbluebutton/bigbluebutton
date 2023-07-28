import { useEffect, useState, useContext } from 'react';
import { useSubscription } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { USERS_SUBSCRIPTION } from 
  '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/queries';

const LoadedUserListContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);
  const { userListLoadedInformation } = useContext(PluginsContext);
  const {
    offset,
    limit,
  } = userListLoadedInformation;

  const { data: usersData } = useSubscription(USERS_SUBSCRIPTION, {
    variables: {
      offset,
      limit,
    },
  });

  const updateSelectedUserForPlugin = () => {
    window.dispatchEvent(new CustomEvent(PluginSdk.Internal.BbbHookEvents.Update, { detail: 
      { 
        data: usersData?.user, 
        hook: PluginSdk.Internal.BbbHooks.UseLoadedUserList,
      } }));
  };

  useEffect(() => {
    updateSelectedUserForPlugin();
  }, [usersData, sendSignal]);

  
  useEffect(() => {
    const updateHookUseLoadedUserList = () => {
      setSendSignal(!sendSignal);
    }
    window.addEventListener(PluginSdk.Internal.BbbHookEvents.NewSubscriber, updateHookUseLoadedUserList);
    return () => {
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.NewSubscriber, updateHookUseLoadedUserList);
    }
  }, []);

  return null;
};

export default LoadedUserListContainer;
