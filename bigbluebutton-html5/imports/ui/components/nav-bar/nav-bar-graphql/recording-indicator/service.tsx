import getFromUserSettings from '/imports/ui/services/users-settings';

const mayIRecord = (amIModerator: boolean, allowStartStopRecording: boolean) => {
  const customRecord = getFromUserSettings('bbb_record_permission', undefined);
  if (!allowStartStopRecording) return false;
  if (customRecord !== undefined) {
    return customRecord;
  }
  return amIModerator;
};

export default {
  mayIRecord,
  getCustomRecordTooltip: (value: string) => getFromUserSettings('bbb_record_permission_tooltip', value),
};
