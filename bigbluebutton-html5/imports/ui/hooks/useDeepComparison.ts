import { isEqual } from 'radash';
import usePreviousValue from './usePreviousValue';

export const useDeepComparison = (...args: unknown[]) => {
  const prev = usePreviousValue(args);
  if (!prev) return true;
  return args.some((item, index) => !isEqual(item, prev[index]));
};

export default useDeepComparison;
