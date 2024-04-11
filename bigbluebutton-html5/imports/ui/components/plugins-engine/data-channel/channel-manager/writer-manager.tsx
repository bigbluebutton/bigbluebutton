import React, { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  DataChannelArguments,
  PushFunction, ObjectTo, ToRole, ToUserId,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import { DataChannelHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { HookEventWrapper, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';

import { PLUGIN_DATA_CHANNEL_DELETE_MUTATION, PLUGIN_DATA_CHANNEL_DISPATCH_MUTATION, PLUGIN_DATA_CHANNEL_RESET_MUTATION } from '../mutations';

export interface DataChannelItemManagerWriterProps {
  pluginName: string;
  channelName: string;
  subChannelName: string;
  pluginApi: PluginSdk.PluginApi;
  dataChannelIdentifier: string;
}

export interface MutationVariables {
  pluginName: string,
  dataChannel: string,
  payloadJson: string,
  toRoles: PluginSdk.DataChannelDispatcherUserRole[],
  toUserIds: string[],
}

export interface SubscriptionVariables {
  subChannelName: string;
  pluginName: string;
  channelName: string;
  createdAt?: string;
}

const DataChannelItemManagerWriter: React.ElementType<DataChannelItemManagerWriterProps> = (
  props: DataChannelItemManagerWriterProps,
) => {
  const {
    pluginName,
    channelName,
    pluginApi,
    subChannelName,
    dataChannelIdentifier,
  } = props;

  const [dispatchPluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_DISPATCH_MUTATION);
  const [deletePluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_DELETE_MUTATION);
  const [resetPluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_RESET_MUTATION);

  const useDataChannelHandlerFunction = ((msg: object, objectsTo?: ObjectTo[]) => {
    const argumentsOfDispatcher = {
      variables: {
        pluginName,
        dataChannel: channelName,
        subChannelName,
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
  }) as PushFunction;

  pluginApi.mapOfDispatchers[dataChannelIdentifier] = useDataChannelHandlerFunction;
  window.dispatchEvent(new Event(`${dataChannelIdentifier}::dispatcherFunction`));

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
            subChannelName,
          },
        });
      } else if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_RESET) {
        const eventDetails = event.detail as UpdatedEventDetails<void>;
        const hookArguments = eventDetails?.hookArguments as DataChannelArguments | undefined;
        resetPluginDataChannelMessage({
          variables: {
            pluginName: hookArguments?.pluginName,
            dataChannel: hookArguments?.channelName,
            subChannelName,
          },
        });
      }
    }) as EventListener;

  useEffect(() => {
    window.addEventListener(HookEvents.UPDATED, deleteOrResetHandler);
    return () => {
      window.removeEventListener(HookEvents.UPDATED, deleteOrResetHandler);
    };
  }, []);
  return null;
};

export default DataChannelItemManagerWriter;
