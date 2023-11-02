import { makeCall } from '/imports/ui/services/api';

export const startTimer = () => {
  makeCall('startTimer');
};

export const stopTimer = () => {
  makeCall('stopTimer');
};

export default {
  startTimer,
  stopTimer,
};
