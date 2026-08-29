import { differenceWith } from 'ramda';

const cmp = (x: { id: string; }, y: { id: string; }) => x.id === y.id;

const getDifferenceBetweenLists = <T extends { id: string; }>(previousState: T[], currentState: T[]): T[][] => {
  const added = differenceWith(cmp, currentState, previousState);
  const removed = differenceWith(cmp, previousState, currentState);
  return [added, removed];
};

export default getDifferenceBetweenLists;
