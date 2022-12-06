import _ from 'lodash';
import ScreenReaderAlertCollection from './collection';

export const addNewAlert = (text) => {
  const payload = {
    id: _.uniqueId('alert-'),
    insertedTime: Date.now(),
    text,
  };

  return ScreenReaderAlertCollection.insert(payload);
};

export const removeAlert = (id) => ScreenReaderAlertCollection.remove({ id });

export default {
  addNewAlert,
  removeAlert,
};
