import { LockSettings } from '/imports/ui/Types/meeting';

// The lock settings mutation takes all eleven, so the ones not changed are sent as they are.
export const lockSettingsVariables = (lockSettings: LockSettings) => ({
  disableCam: lockSettings.disableCam,
  disableMic: lockSettings.disableMic,
  disablePrivChat: lockSettings.disablePrivateChat,
  disablePubChat: lockSettings.disablePublicChat,
  disableNotes: lockSettings.disableNotes,
  hideUserList: lockSettings.hideUserList,
  hideViewersCursor: lockSettings.hideViewersCursor,
  lockOnJoin: lockSettings.lockOnJoin,
  lockOnJoinConfigurable: lockSettings.lockOnJoinConfigurable,
  hideViewersAnnotation: lockSettings.hideViewersAnnotation,
  presenterPolicy: lockSettings.presenterPolicy,
});

export default { lockSettingsVariables };
