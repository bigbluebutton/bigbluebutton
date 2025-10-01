import React, { useEffect, useRef, useState } from 'react';
// import { DocumentNode } from 'graphql';

import {
  GraphqlResponseWrapper, HookEventWrapper, SubscribedEventDetails, UpdatedEventDetails,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { DataChannelHooks, DataChannelTypes } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataChannelArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import { DataChannelEntry } from '../types';

export interface DataChannelItemManagerReaderProps {
  pluginName: string;
  channelName: string;
  subChannelName: string;
  dataChannelType: DataChannelTypes;
  dataChannelIdentifier: string;
  dataChannelEntriesReceived: DataChannelEntry[];
}

export interface SubscriptionVariables {
  subChannelName: string;
  pluginName: string;
  channelName: string;
  createdAt?: string;
}

const areListsDifferent = (
  previousList: DataChannelEntry[], currentList: DataChannelEntry[],
): boolean => currentList.length !== previousList.length || currentList.some((l2Entry) => {
  const indexOfEntry = previousList.findIndex((l1Entry) => l1Entry.entryId === l2Entry.entryId);
  if (indexOfEntry === -1) return true;
  const l1Entry = previousList[indexOfEntry];
  return l1Entry.updatedAt !== l2Entry.updatedAt;
});

const getDifference = (
  previousList: DataChannelEntry[], currentList: DataChannelEntry[],
): DataChannelEntry[] => currentList.filter((l2Entry) => {
  const indexOfEntry = previousList.findIndex((l1Entry) => l1Entry.entryId === l2Entry.entryId);
  if (indexOfEntry === -1) return true;
  const l1Entry = previousList[indexOfEntry];
  return l1Entry.updatedAt !== l2Entry.updatedAt;
});

export const DataChannelItemManagerReader: React.ElementType<DataChannelItemManagerReaderProps> = (
  props: DataChannelItemManagerReaderProps,
) => {
  const {
    pluginName,
    channelName,
    dataChannelType,
    subChannelName,
    dataChannelIdentifier,
    dataChannelEntriesReceived,
  } = props;
  const [sendSignal, setSendSignal] = useState<boolean>(false);
  const [completeDataEntry, setCompleteDataEntry] = useState<DataChannelEntry[]>([]);
  const [differenceData, setDifferenceData] = useState<DataChannelEntry[]>([]);
  const startedAtTimestamp = useRef(new Date());

  useEffect(() => {
    const updateAllItems = () => {
      const listsDifferent = areListsDifferent(completeDataEntry, dataChannelEntriesReceived);
      if (listsDifferent) {
        setCompleteDataEntry(dataChannelEntriesReceived);
      }
    };

    const updateDifferenceItems = (afterSubscription: boolean) => {
      const differenceList = getDifference(completeDataEntry, dataChannelEntriesReceived);
      const resultingDifference = (afterSubscription) ? differenceList.filter(
        (entry) => new Date(entry.createdAt) >= startedAtTimestamp.current,
      ) : differenceList;
      const dataChannelWasReset = dataChannelEntriesReceived.length === 0 && completeDataEntry.length !== 0;
      if (resultingDifference.length > 0 || dataChannelWasReset) {
        setDifferenceData(resultingDifference);
        setCompleteDataEntry(dataChannelEntriesReceived);
      }
    };

    switch (dataChannelType) {
      case DataChannelTypes.LATEST_ITEM:
        updateDifferenceItems(false);
        break;
      case DataChannelTypes.NEW_ITEMS:
        updateDifferenceItems(true);
        break;
      case DataChannelTypes.ALL_ITEMS:
        updateAllItems();
        break;
      default:
        updateAllItems();
        break;
    }
  }, [dataChannelEntriesReceived]);

  useEffect(() => {
    const subscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_BUILDER) {
          const eventDetails = event.detail as SubscribedEventDetails;
          const hookArguments = eventDetails?.hookArguments as DataChannelArguments;
          const dataChannelTypeFromEvent = hookArguments.dataChannelType!;
          if (hookArguments?.channelName && hookArguments?.pluginName
            && hookArguments.subChannelName === subChannelName
            && hookArguments.pluginName === pluginName
            && hookArguments.channelName === channelName
            && dataChannelTypeFromEvent === dataChannelType
          ) {
            setSendSignal((signal) => !signal);
          }
        }
      }) as EventListener;

    window.addEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
    return () => {
      window.removeEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
    };
  }, []);

  useEffect(() => {
    let dataToBeSent;
    switch (dataChannelType) {
      case DataChannelTypes.LATEST_ITEM:
        dataToBeSent = differenceData;
        break;
      case DataChannelTypes.NEW_ITEMS:
        dataToBeSent = differenceData;
        break;
      case DataChannelTypes.ALL_ITEMS:
        dataToBeSent = completeDataEntry;
        break;
      default:
        dataToBeSent = completeDataEntry;
        break;
    }

    const dataResult = {
      data: dataToBeSent,
      loading: !dataToBeSent,
    } as GraphqlResponseWrapper<object>;

    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<
      GraphqlResponseWrapper<object>
    >>(dataChannelIdentifier, {
      detail: {
        hook: DataChannelHooks.DATA_CHANNEL_BUILDER,
        data: dataResult,
        hookArguments: {
          dataChannelType,
          pluginName,
          channelName,
          subChannelName,
        },
      },
    }),
    );
  }, [sendSignal, completeDataEntry, differenceData]);

  return null;
};
