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

const removeGenericContentBadge = (id: string) => setGenericContentBadges((badges) => {
  if (!Object.hasOwn(badges, id)) return badges;
  const remainingBadges = { ...badges };
  delete remainingBadges[id];
  return remainingBadges;
});

export {
  useGenericContentBadge,
  setGenericContentBadges,
  removeGenericContentBadge,
};
