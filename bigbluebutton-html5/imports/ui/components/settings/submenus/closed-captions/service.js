import Storage from '/imports/ui/services/storage/session';

getClosedCaptionSettings = () => {
  const ccSettings = {};
  const ccEnabled = Storage.getItem('closedCaptions');
  ccSettings.ccEnabled = !!ccEnabled;

  return ccSettings;
};

export default {
  getClosedCaptionSettings,
};
