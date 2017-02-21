import Storage from '/imports/ui/services/storage/session';
import Captions from '/imports/api/captions';

const updateSettings = (state) => {
  Object.keys(state).forEach(k => Storage.setItem(`settings_${k}`, state[k]));
};

const getSettingsFor = (key) => {
  const setting = Storage.getItem(`settings_${key}`);

  console.log('settigs fetched', key, setting);

  return setting;
};

const getClosedCaptionLocales = () => {
  //list of unique locales in the Captions Collection
  const locales = _.uniq(Captions.find({}, {
    sort: { locale: 1 },
    fields: { locale: true },
  }).fetch().map(function (obj) {
    return obj.locale;
  }), true);

  return locales;
};

export {
  updateSettings,
  getSettingsFor,
  getClosedCaptionLocales,
};
