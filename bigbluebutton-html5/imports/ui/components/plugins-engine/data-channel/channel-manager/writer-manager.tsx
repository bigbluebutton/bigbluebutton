import React, { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  DataChannelArguments,
  PushEntryFunction, ObjectTo, ToRole, ToUserId,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import { DataChannelHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { HookEventWrapper, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';

import { PLUGIN_DATA_CHANNEL_DELETE_MUTATION, PLUGIN_DATA_CHANNEL_PUSH_MUTATION, PLUGIN_DATA_CHANNEL_RESET_MUTATION } from '../mutations';

export interface DataChannelItemManagerWriterProps {
  pluginName: string;
  channelName: string;
  subChannelName: string;
  pluginApi: PluginSdk.PluginApi;
  dataChannelIdentifier: string;
}

export interface MutationVariables {
  pluginName: string,
  channelName: string,
  payloadJson: string,
  toRoles: PluginSdk.DataChannelPushEntryFunctionUserRole[],
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

  const [pushEntryFunctionPluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_PUSH_MUTATION);
  const [deleteEntryFunctionPluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_DELETE_MUTATION);
  const [resetFunctionPluginDataChannelMessage] = useMutation(PLUGIN_DATA_CHANNEL_RESET_MUTATION);

  const useDataChannelHandlerFunction = ((msg: object, objectsTo?: ObjectTo[]) => {
    const argumentsOfPushEntryFunction = {
      variables: {
        pluginName,
        channelName,
        subChannelName,
        payloadJson: JSON.stringify(msg),
        toRoles: [],
        toUserIds: [],
      } as MutationVariables,
    };

    if (objectsTo) {
      const rolesTo: PluginSdk.DataChannelPushEntryFunctionUserRole[] = objectsTo.filter((
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
      if (rolesTo.length > 0) argumentsOfPushEntryFunction.variables.toRoles = rolesTo;
      if (usersTo.length > 0) argumentsOfPushEntryFunction.variables.toUserIds = usersTo;
    }
    pushEntryFunctionPluginDataChannelMessage(argumentsOfPushEntryFunction);
  }) as PushEntryFunction;

  pluginApi.mapOfPushEntryFunctions[dataChannelIdentifier] = useDataChannelHandlerFunction;
  window.dispatchEvent(new Event(`${dataChannelIdentifier}::pushEntryFunction`));

  const deleteOrResetHandler: EventListener = (
    (event: HookEventWrapper<void>) => {
      if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_DELETE) {
        const eventDetails = event.detail as UpdatedEventDetails<string>;
        const hookArguments = eventDetails?.hookArguments as DataChannelArguments | undefined;
        deleteEntryFunctionPluginDataChannelMessage({
          variables: {
            pluginName: hookArguments?.pluginName,
            channelName: hookArguments?.channelName,
            messageId: eventDetails.data,
            subChannelName,
          },
        });
      } else if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_RESET) {
        const eventDetails = event.detail as UpdatedEventDetails<void>;
        const hookArguments = eventDetails?.hookArguments as DataChannelArguments | undefined;
        resetFunctionPluginDataChannelMessage({
          variables: {
            pluginName: hookArguments?.pluginName,
            channelName: hookArguments?.channelName,
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
