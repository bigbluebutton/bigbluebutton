import React, { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  DataChannelArguments,
  PushEntryFunction, ObjectTo, ToRole, ToUserId,
  ReplaceEntryFunctionArguments,
  PushEntryFunctionOptionArgument,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import { DataChannelHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { HookEventWrapper, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';

import {
  PLUGIN_DATA_CHANNEL_DELETE_MUTATION, PLUGIN_DATA_CHANNEL_PUSH_MUTATION,
  PLUGIN_DATA_CHANNEL_REPLACE_MUTATION, PLUGIN_DATA_CHANNEL_RESET_MUTATION,
} from '../mutations';
import logger from '/imports/startup/client/logger';

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
  payloadJson: object,
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

  const [pushEntryFunctionPluginDataChannel] = useMutation(PLUGIN_DATA_CHANNEL_PUSH_MUTATION);
  const [deleteEntryFunctionPluginDataChannel] = useMutation(PLUGIN_DATA_CHANNEL_DELETE_MUTATION);
  const [resetFunctionPluginDataChannel] = useMutation(PLUGIN_DATA_CHANNEL_RESET_MUTATION);
  const [replaceEntryFunctionPluginDataChannel] = useMutation(PLUGIN_DATA_CHANNEL_REPLACE_MUTATION);

  const useDataChannelHandlerFunction = ((msg: object, options?: PushEntryFunctionOptionArgument) => {
    const {
      receivers: objectsTo,
    } = options || {
      receivers: undefined,
    };
    if (!msg) {
      logger.error({
        logCode: 'plugin_data_channel',
        extraInfo: {
          pluginName,
          channelName,
          subChannelName,
        },
      }, `Payload for plugin data-channel ${channelName} is null, ignoring entry.`);
      return;
    }
    const argumentsOfPushEntryFunction = {
      variables: {
        pluginName,
        channelName,
        subChannelName,
        payloadJson: msg,
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
    pushEntryFunctionPluginDataChannel(argumentsOfPushEntryFunction);
    logger.debug({
      logCode: 'plugin_data_channel',
      extraInfo: {
        pluginName,
        channelName,
        subChannelName,
      },
    }, `Payload [${JSON.stringify(msg)}] for data-channel '${channelName}' sent to server.`);
  }) as PushEntryFunction;

  pluginApi.mapOfPushEntryFunctions[dataChannelIdentifier] = useDataChannelHandlerFunction;
  window.dispatchEvent(new Event(`${dataChannelIdentifier}::pushEntryFunction`));

  const deleteOrResetHandler: EventListener = (
    (event: HookEventWrapper<void>) => {
      if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_DELETE) {
        const eventDetails = event.detail as UpdatedEventDetails<string>;
        const {
          pluginName: comingPluginName,
          channelName: comingChannelName,
          subChannelName: comingSubChannelName,
        } = eventDetails?.hookArguments as DataChannelArguments;
        if (
          comingPluginName === pluginName
          && comingChannelName === channelName
          && comingSubChannelName === subChannelName
        ) {
          deleteEntryFunctionPluginDataChannel({
            variables: {
              pluginName,
              channelName,
              entryId: eventDetails.data,
              subChannelName,
            },
          });
          logger.debug({
            logCode: 'plugin_data_channel',
            extraInfo: {
              pluginName,
              channelName,
              subChannelName,
            },
          }, `Delete message for data-channel '${channelName}' with entryId=${eventDetails.data} sent to server.`);
        }
      } else if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_RESET) {
        const eventDetails = event.detail as UpdatedEventDetails<void>;
        const {
          pluginName: comingPluginName,
          channelName: comingChannelName,
          subChannelName: comingSubChannelName,
        } = eventDetails?.hookArguments as DataChannelArguments;
        if (
          comingPluginName === pluginName
          && comingChannelName === channelName
          && comingSubChannelName === subChannelName
        ) {
          resetFunctionPluginDataChannel({
            variables: {
              pluginName,
              channelName,
              subChannelName,
            },
          });
          logger.debug({
            logCode: 'plugin_data_channel',
            extraInfo: {
              pluginName,
              channelName,
              subChannelName,
            },
          }, `Reset message for data-channel '${channelName}' sent to server`);
        }
      }
    }) as EventListener;

  const replaceEntryHandler: EventListener = (
    (event: HookEventWrapper<void>) => {
      if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_REPLACE) {
        const eventDetails = event.detail as UpdatedEventDetails<ReplaceEntryFunctionArguments<object>>;
        const {
          pluginName: comingPluginName,
          channelName: comingChannelName,
          subChannelName: comingSubChannelName,
        } = eventDetails?.hookArguments as DataChannelArguments;
        if (
          comingPluginName === pluginName
          && comingChannelName === channelName
          && comingSubChannelName === subChannelName
        ) {
          replaceEntryFunctionPluginDataChannel({
            variables: {
              pluginName,
              channelName,
              subChannelName,
              entryId: eventDetails.data.entryId,
              payloadJson: eventDetails.data.payloadJson,
            },
          });
        }
      }
    }) as EventListener;

  useEffect(() => {
    window.addEventListener(HookEvents.PLUGIN_SENT_CHANGES_TO_BBB_CORE, deleteOrResetHandler);
    window.addEventListener(HookEvents.PLUGIN_SENT_CHANGES_TO_BBB_CORE, replaceEntryHandler);
    return () => {
      window.removeEventListener(HookEvents.PLUGIN_SENT_CHANGES_TO_BBB_CORE, deleteOrResetHandler);
      window.removeEventListener(HookEvents.PLUGIN_SENT_CHANGES_TO_BBB_CORE, replaceEntryHandler);
    };
  }, []);
  return null;
};

export default DataChannelItemManagerWriter;
