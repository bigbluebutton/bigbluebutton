import createUseLocalState from './createUseLocalState';
import useReactiveVarSelector from '../hooks/useReactiveVarSelector';

type GenericContentMenuNames = Record<string, string>;

const [
  ,
  setGenericContentMenuNames,
  genericContentMenuNamesVar,
] = createUseLocalState<GenericContentMenuNames>({});

const useGenericContentMenuName = (id: string) => useReactiveVarSelector(
  genericContentMenuNamesVar,
  // A plain object inherits Object.prototype keys, which a plugin id may collide with.
  (menuNames) => (Object.hasOwn(menuNames, id) ? menuNames[id] : undefined),
);

const removeGenericContentMenuName = (id: string) => setGenericContentMenuNames((menuNames) => {
  if (!Object.hasOwn(menuNames, id)) return menuNames;
  const remainingMenuNames = { ...menuNames };
  delete remainingMenuNames[id];
  return remainingMenuNames;
});

export {
  useGenericContentMenuName,
  setGenericContentMenuNames,
  removeGenericContentMenuName,
};
