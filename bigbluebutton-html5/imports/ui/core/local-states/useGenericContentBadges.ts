import { useMemo } from 'react';
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
  // A plain object inherits Object.prototype keys, which a plugin id may collide with.
  (badges) => (Object.hasOwn(badges, id) ? badges[id] : undefined),
);

// Serialized so that a badge content update, which keeps the same ids, does not
// re-render the caller.
const useGenericContentBadgeIds = (): string[] => {
  const serializedIds = useReactiveVarSelector(
    genericContentBadgesVar,
    (badges) => JSON.stringify(Object.keys(badges)),
  );
  return useMemo(() => JSON.parse(serializedIds), [serializedIds]);
};

export {
  useGenericContentBadge,
  useGenericContentBadgeIds,
  setGenericContentBadges,
};
