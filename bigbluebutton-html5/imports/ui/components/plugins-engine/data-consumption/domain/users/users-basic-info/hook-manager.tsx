import { useEffect } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UserBasicInfo } from '/imports/ui/Types/user';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { GeneralHookManagerProps } from '../../../types';
import useUsersBasicInfo from '/imports/ui/core/hooks/useUsersBasicInfo';
import formatUsersBasicInfoDataFromGraphql from './utils';

const UsersBasicInfoHookContainer = (prop: GeneralHookManagerProps) => {
  const usersData = useUsersBasicInfo((user: Partial<UserBasicInfo>) => ({
    userId: user.userId,
    extId: user.extId,
    name: user.name,
    nameSortable: user.nameSortable,
    bot: user.bot,
    role: user.role,
    avatar: user.avatar,
    color: user.color,
    isModerator: user.isModerator,
    presenter: user.presenter,
  }));

  const { version } = prop;
  const previousVersion = usePreviousValue(version);

  const updateUsersBasicInfoForPlugin = () => {
    window.dispatchEvent(new CustomEvent<
      UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.UsersBasicInfoResponseFromGraphqlWrapper>>
    >(HookEvents.BBB_CORE_SENT_NEW_DATA, {
      detail: {
        data: formatUsersBasicInfoDataFromGraphql(usersData),
        hook: DataConsumptionHooks.USERS_BASIC_INFO,
      },
    }));
  };

  useEffect(() => {
    const previousVersionValue = previousVersion ?? 0;
    if (version > previousVersionValue) {
      updateUsersBasicInfoForPlugin();
    }
  }, [version]);

  useEffect(() => {
    updateUsersBasicInfoForPlugin();
  }, [usersData]);

  return null;
};

export default UsersBasicInfoHookContainer;
