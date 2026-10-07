import createUseLocalState from './createUseLocalState';
import useReactiveVarSelector from '../hooks/useReactiveVarSelector';

type GenericContentBadges = Record<string, string>;

const [
  ,
  setGenericContentBadges,
  genericContentBadgesVar,
] = createUseLocalState<GenericContentBadges>({});

const useGenericContentBadge = (id: string) => useReactiveVarSelector(
  genericContentBadgesVar,
  (badges) => badges[id],
);

export {
  useGenericContentBadge,
  setGenericContentBadges,
};
