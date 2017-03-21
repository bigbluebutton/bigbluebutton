import Storage from '/imports/ui/services/storage/session';
import Captions from '/imports/api/captions';

getClosedCaptionSettings = () => {
  let ccSettings = {};
  let ccEnabled = Storage.getItem('closedCaptions');
  ccSettings.ccEnabled = !!ccEnabled;

  //list of unique locales in the Captions Collection
  let locales = _.uniq(Captions.find({}, {
    sort: { locale: 1 },
    fields: { locale: true },
  }).fetch().map(function (obj) {
    return obj.locale;
  }), true);

  //adding the list of active locales to the closed-captions settings object
  ccSettings.locales = locales;

  return ccSettings;
}

export default {
  getClosedCaptionSettings,
};
