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
  (menuNames) => menuNames[id],
);

export {
  useGenericContentMenuName,
  setGenericContentMenuNames,
};
