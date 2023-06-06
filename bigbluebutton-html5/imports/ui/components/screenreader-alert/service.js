import ScreenReaderAlertCollection from './collection';
import { uniqueId } from '/imports/utils/string-utils';

export const addNewAlert = (text) => {
  const payload = {
    id: uniqueId('alert-'),
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
