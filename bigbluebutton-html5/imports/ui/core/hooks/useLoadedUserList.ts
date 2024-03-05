import { makeVar, useReactiveVar } from '@apollo/client';
import { isEqual } from 'radash';
import { User } from '../../Types/user';

const createLoadedUserListDataGathering = (): [
  (fn: (c: Partial<User>) => Partial<User>) => [
    Partial<User>[],
    (result: Partial<User>[]) => void,
  ],
  (result: Partial<User>[]) => void,
] => {
  const loadedUserList = makeVar<Partial<User>[]>([]);

  const setLoadedUserList = (result: Partial<User>[]): void => {
    const gatheredUserList = loadedUserList();
    const hasUsers = gatheredUserList && gatheredUserList.length > 0;
    const shouldAdd = !hasUsers || !isEqual(gatheredUserList, result);
    if (shouldAdd) {
      const a = {
        ...loadedUserList(),
        result,
      };
      loadedUserList(a);
    }
  };

  const useLoadedUserList = (fn: ((c: Partial<User>) => Partial<User>)): [
    Partial<User>[],
    (result: Partial<User>[]) => void,
  ] => {
    const gatheredLoadedUserList = useReactiveVar(loadedUserList);
    const loadedUserListData = Object.values(gatheredLoadedUserList).filter((i) => Array.isArray(i)).flat();
    return [loadedUserListData.map(fn), setLoadedUserList];
  };

  return [useLoadedUserList, setLoadedUserList];
};

const [useLoadedUserList, setLoadedUserList] = createLoadedUserListDataGathering();

export { useLoadedUserList, setLoadedUserList };
