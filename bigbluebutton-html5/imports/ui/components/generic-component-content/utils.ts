import { difference } from 'ramda';

const getDifferenceBetweenLists = <T>(previousState: T[], currentState: T[]): T[][] => {
  const added = difference(currentState, previousState);
  const removed = difference(previousState, currentState);
  return [added, removed];
};

export default getDifferenceBetweenLists;
