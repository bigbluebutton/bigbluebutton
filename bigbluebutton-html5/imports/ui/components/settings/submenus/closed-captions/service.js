import Storage from '/imports/ui/services/storage/session';

getClosedCaptionSettings = () => {
  let ccSettings = {};
  let ccEnabled = Storage.getItem('closedCaptions');
  ccSettings.ccEnabled = !!ccEnabled;

  return ccSettings;
};

export default {
  getClosedCaptionSettings,
};
