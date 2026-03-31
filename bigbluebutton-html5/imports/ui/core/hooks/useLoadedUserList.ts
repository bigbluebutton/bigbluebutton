import { makeVar, useReactiveVar } from '@apollo/client';
import { isEqual } from 'radash';
import { User } from '../../Types/user';
import { useCreateUseSubscription } from './createUseSubscription';
import useStableResponse from './useStableResponse';
import { userListComparator, userComparator } from '/imports/ui/core/graphql/comparators/userListComparators';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { USER_LIST_SUBSCRIPTION } from '../graphql/queries/users';
import { makeUserSearchWhere } from '/imports/ui/components/user-list/service';

const createLocalUserListDataGathering = (): [
  (fn: (c: Partial<User>) => Partial<User>) => [
    Partial<User>[],
    (result: Partial<User>[]) => void,
  ],
  (result: Partial<User>[]) => void,
] => {
  const loadedUserList = makeVar<Partial<User>[]>([]);

  const setLocalUserList = (result: Partial<User>[]): void => {
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

  const useLocalUserList = (fn: ((c: Partial<User>) => Partial<User>)): [
    Partial<User>[],
    (result: Partial<User>[]) => void,
  ] => {
    const gatheredLoadedUserList = useReactiveVar(loadedUserList);
    const loadedUserListData = Object.values(gatheredLoadedUserList).filter((i) => Array.isArray(i)).flat();
    return [loadedUserListData.map(fn), setLocalUserList];
  };

  return [useLocalUserList, setLocalUserList];
};

const useLoadedUserList = (
  variables: { offset: number, limit: number, searchQuery?: string },
  fn: (c: Partial<User>) => Partial<User>,
) => {
  const where = makeUserSearchWhere(variables.searchQuery);

  const useLoadedUserListSubscription = useCreateUseSubscription<User>(
    USER_LIST_SUBSCRIPTION,
    {
      offset: variables.offset,
      limit: variables.limit,
      where,
    },
    true,
  );
  const loadedUserList = useLoadedUserListSubscription(fn);
  return useStableResponse<Partial<User>[], Partial<User>>(
    loadedUserList as GraphqlDataHookSubscriptionResponse<Partial<User>[]>,
    {
      compare: userListComparator,
      itemCompare: userComparator,
      itemKey: (item) => item.userId ?? '',
    },
  );
};

const [useLocalUserList, setLocalUserList] = createLocalUserListDataGathering();

export {
  useLoadedUserList,
  useLocalUserList,
  setLocalUserList,
};

export default {
  useLoadedUserList,
  useLocalUserList,
  setLocalUserList,
};
