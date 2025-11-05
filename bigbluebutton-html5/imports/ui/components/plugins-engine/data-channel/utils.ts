import { DataChannelEntry } from './types';

export const mapProjectedDataChannelEntries = (
  receivedDataChannelEntries: Partial<DataChannelEntry>[] | undefined | null,
): DataChannelEntry[] => receivedDataChannelEntries?.map((entry) => ({
  createdAt: entry.createdAt!,
  channelName: entry.channelName!,
  subChannelName: entry.subChannelName!,
  entryId: entry.entryId!,
  payloadJson: entry.payloadJson!,
  updatedAt: entry.updatedAt!,
  createdBy: entry.createdBy!,
  pluginName: entry.pluginName!,
  toRoles: entry.toRoles ?? [],
})) || [];

const dateComparisonDesc = (date1: Date, date2: Date): number => {
  const time1 = date1.getTime();
  const time2 = date2.getTime();
  if (time1 === time2) return 0;
  if (time1 > time2) return -1;
  return 1;
};

export const mergeDataChannelEntries = (
  receivedPublicDataChannelEntries: Partial<DataChannelEntry>[] | undefined | null,
  receivedPrivateDataChannelEntries: Partial<DataChannelEntry>[] | undefined | null,
): DataChannelEntry[] => {
  let allPrivateDataChannelEntries = mapProjectedDataChannelEntries(
    receivedPublicDataChannelEntries,
  );
  const hasPrivateDataChannelEntries = receivedPrivateDataChannelEntries
    && receivedPrivateDataChannelEntries.length !== 0;
  if (hasPrivateDataChannelEntries) {
    allPrivateDataChannelEntries = allPrivateDataChannelEntries.concat(
      mapProjectedDataChannelEntries(receivedPrivateDataChannelEntries),
    ).sort((entry1, entry2) => (dateComparisonDesc(
      new Date(entry1.createdAt), new Date(entry2.createdAt),
    )));
  }
  return allPrivateDataChannelEntries;
};

export default mapProjectedDataChannelEntries;
