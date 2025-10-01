import { DataChannelEntry } from './types';

const mapProjectedDataChannelEntries = (
  receivedDataChannelEntries: Partial<DataChannelEntry>[] | undefined | null,
): DataChannelEntry[] => receivedDataChannelEntries?.map((entry) => ({
  createdAt: entry.createdAt!,
  channelName: entry.channelName!,
  subChannelName: entry.subChannelName!,
  entryId: entry.entryId!,
  payloadJson: entry.payloadJson!,
  updatedAt: entry.updatedAt!,
  fromUserId: entry.createdBy!,
  createdBy: entry.createdBy!,
  pluginName: entry.pluginName!,
  toRoles: entry.toRoles ?? [],
})) || [];

export default mapProjectedDataChannelEntries;
