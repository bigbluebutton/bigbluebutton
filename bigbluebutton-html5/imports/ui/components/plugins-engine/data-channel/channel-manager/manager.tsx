import React, { useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { createChannelIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/utils';
import {
  DataChannelArguments,
  DispatcherFunction, ObjectTo, ToRole, ToUserId,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import { DataChannelHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { HookEventWrapper, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';

import PLUGIN_DATA_CHANNEL_FETCH_QUERY from '../queries';
import { PLUGIN_DATA_CHANNEL_DELETE_MUTATION, PLUGIN_DATA_CHANNEL_DISPATCH_MUTATION, PLUGIN_DATA_CHANNEL_RESET_MUTATION } from '../mutation';

export interface DataChannelItemManagerProps {
  pluginName: string;
  channelName: string;
  pluginApi: PluginSdk.PluginApi
}

export interface MutationVariables {
  pluginName: string,
  dataChannel: string,
  payloadJson: string,
  toRoles: PluginSdk.DataChannelDispatcherUserRole[],
  toUserIds: string[],
}

export const DataChannelItemManager: React.ElementType<DataChannelItemManagerProps> = (
  props: DataChannelItemManagerProps,
) => {
  const {
    pluginName,
    channelName,
    pluginApi,
  } = props;
  const pluginIdentifier = createChannelIdentifier(channelName, pluginName);

  const dataChannelIdentifier = createChannelIdentifier(channelName, pluginName);
  const [dispatchPluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_DISPATCH_MUTATION);
  const [deletePluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_DELETE_MUTATION);
  const [resetPluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_RESET_MUTATION);

  const data = useSubscription(PLUGIN_DATA_CHANNEL_FETCH_QUERY, {
    variables: {
      pluginName,
      channelName,
    },
  });

  const useDataChannelHandlerFunction = ((msg: object, objectsTo?: ObjectTo[]) => {
    const argumentsOfDispatcher = {
      variables: {
        pluginName,
        dataChannel: channelName,
        payloadJson: JSON.stringify(msg),
        toRoles: [],
        toUserIds: [],
      } as MutationVariables,
    };

    if (objectsTo) {
      const rolesTo: PluginSdk.DataChannelDispatcherUserRole[] = objectsTo.filter((
        object: ObjectTo,
      ) => 'role' in object).map(
        (object: ObjectTo) => {
          const toRole = object as ToRole;
          return toRole.role;
        },
      );
      const usersTo = objectsTo.filter((
        object: ObjectTo,
      ) => 'userId' in object).map(
        (object: ObjectTo) => {
          const toUserId = object as ToUserId;
          return toUserId.userId;
        },
      );
      if (rolesTo.length > 0) argumentsOfDispatcher.variables.toRoles = rolesTo;
      if (usersTo.length > 0) argumentsOfDispatcher.variables.toUserIds = usersTo;
    }
    dispatchPluginDataChannelMessage(argumentsOfDispatcher);
  }) as DispatcherFunction;

  pluginApi.mapOfDispatchers[pluginIdentifier] = useDataChannelHandlerFunction;
  window.dispatchEvent(new Event(`${pluginIdentifier}::dispatcherFunction`));

  const deleteOrResetHandler: EventListener = (
    (event: HookEventWrapper<void>) => {
      if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_DELETE) {
        const eventDetails = event.detail as UpdatedEventDetails<string>;
        const hookArguments = eventDetails?.hookArguments as DataChannelArguments | undefined;
        deletePluginDataChannelMessage({
          variables: {
            pluginName: hookArguments?.pluginName,
            dataChannel: hookArguments?.channelName,
            messageId: eventDetails.data,
          },
        });
      } else if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_RESET) {
        const eventDetails = event.detail as UpdatedEventDetails<void>;
        const hookArguments = eventDetails?.hookArguments as DataChannelArguments | undefined;
        resetPluginDataChannelMessage({
          variables: {
            pluginName: hookArguments?.pluginName,
            dataChannel: hookArguments?.channelName,
          },
        });
      }
    }) as EventListener;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(dataChannelIdentifier, {
        detail: { hook: DataChannelHooks.DATA_CHANNEL_BUILDER, data },
      }),
    );
  }, [data]);

  useEffect(() => {
    window.addEventListener(HookEvents.UPDATED, deleteOrResetHandler);
    return () => {
      window.removeEventListener(HookEvents.UPDATED, deleteOrResetHandler);
    };
  }, []);

  return null;
};
