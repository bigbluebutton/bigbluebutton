import createUseSubscription from './createUseSubscription';
import GET_TIMER, { TimerData } from '../graphql/queries/timer';

const useTimerSubscription = createUseSubscription<TimerData>(GET_TIMER, {}, true);

export const useTimer = (fn: (c: Partial<TimerData>) => Partial<TimerData> = (t) => t) => {
  const response = useTimerSubscription(fn);
  return {
    ...response,
    data: response.data?.[0],
  };
};

export default useTimer;
