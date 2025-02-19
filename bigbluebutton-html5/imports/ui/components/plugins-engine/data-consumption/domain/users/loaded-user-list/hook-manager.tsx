import { useEffect } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import formatLoadedUserListDataFromGraphql from './utils';
import { useLocalUserList } from '/imports/ui/core/hooks/useLoadedUserList';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { GeneralHookManagerProps } from '../../../types';

const LoadedUserListHookContainer = (prop: GeneralHookManagerProps) => {
  const [usersData] = useLocalUserList((user: Partial<User>) => ({
    userId: user.userId,
    name: user.name,
    role: user.role,
  }));

  const { numberOfUses } = prop;
  const previousNumberOfUses = usePreviousValue(numberOfUses);

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
    const previousNumberOfUsesValue = previousNumberOfUses || 0;
    if (numberOfUses > previousNumberOfUsesValue) {
      updateLoadedUserListForPlugin();
    }
  }, [numberOfUses]);

  useEffect(() => {
    updateLoadedUserListForPlugin();
  }, [usersData]);

  return null;
};

export default LoadedUserListHookContainer;
