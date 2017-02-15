import Storage from '/imports/ui/services/storage/session';

const updateSettings = (state) => {
  Object.keys(state).forEach(k => Storage.setItem(`settings_${k}`, state[k]));
};

const getSettingsFor = (key) => {
  const setting = Storage.getItem(`settings_${key}`);

  console.log('settigs fetched', key, setting);

  return setting;
};

export {
  updateSettings,
  getSettingsFor,
};
