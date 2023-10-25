import React, { useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PLUGIN_DATA_CHANNEL_DISPATCH_QUERY, PLUGIN_DATA_CHANNEL_FETCH_QUERY } from '../../queries';

interface DataChannelItemManagerProps {
  pluginName: string;
  channelName: string;
}

interface Variables {
  pluginName: string,
  dataChannel: string,
  payloadJson: string,
  toRoles: PluginSdk.Roles[],
  toUserIds: string[],
}

const DataChannelItemManager: React.ElementType<DataChannelItemManagerProps> = (props: DataChannelItemManagerProps) => {
  const {
    pluginName,
    channelName,
  } = props;
  const pluginIdentifier = PluginSdk.createChannelIdentifier(channelName, pluginName);

  const dataChannelIdentifier = PluginSdk.createChannelIdentifier(channelName, pluginName);
  const [dispatchPluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_DISPATCH_QUERY);

  const data = useSubscription(PLUGIN_DATA_CHANNEL_FETCH_QUERY, {
    variables: {
      pluginName,
    },
  });

  const useDataChannelHandlerFunction = ((msg: object, objectsTo?: PluginSdk.ObjectTo[]) => {
    const argumentsOfDispatcher = {
      variables: {
        pluginName,
        dataChannel: channelName,
        payloadJson: JSON.stringify(msg),
        toRoles: [],
        toUserIds: [],
      } as Variables,
    };

    if (objectsTo) {
      const rolesTo: PluginSdk.Roles[] = objectsTo.filter((
        object: PluginSdk.ObjectTo,
      ) => 'role' in object).map(
        (object: PluginSdk.ObjectTo) => {
          const roleTo = object as PluginSdk.RoleTo;
          return roleTo.role;
        },
      );
      const usersTo = objectsTo.filter((
        object: PluginSdk.ObjectTo,
      ) => 'userId' in object).map(
        (object: PluginSdk.ObjectTo) => {
          const userIdTo = object as PluginSdk.UserIdTo;
          return userIdTo.userId;
        },
      );
      if (rolesTo.length > 0) argumentsOfDispatcher.variables.toRoles = rolesTo;
      if (usersTo.length > 0) argumentsOfDispatcher.variables.toUserIds = usersTo;
    }
    dispatchPluginDataChannelMessage(argumentsOfDispatcher);
  }) as PluginSdk.DispatcherFunction;

  window.dispatchEvent(new CustomEvent(`${pluginIdentifier}::dispatcherFunction`, {
    detail: {
      hook: PluginSdk.Internal.BbbDataChannel.UseDataChannel, data: useDataChannelHandlerFunction,
    },
  }));

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(dataChannelIdentifier, {
        detail: { hook: PluginSdk.Internal.BbbDataChannel.UseDataChannel, data },
      }),
    );
  }, [data]);
  return null;
};

export default DataChannelItemManager;
