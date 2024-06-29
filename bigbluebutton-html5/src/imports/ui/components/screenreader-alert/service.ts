import { uniqueId } from '/imports/utils/string-utils';
import Queue from './queue';

export const addAlert = (text: string) => {
  const alert = {
    id: uniqueId('alert-'),
    text,
  };

  Queue.push(alert);
};

export const shiftAlert = () => {
  Queue.shift();
};

export default {
  addAlert,
  shiftAlert,
};
