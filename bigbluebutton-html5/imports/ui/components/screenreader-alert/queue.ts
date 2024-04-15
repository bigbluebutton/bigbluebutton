import createUseLocalState from '/imports/ui/core/local-states/createUseLocalState';

export interface ScreenReaderAlert {
  id: string;
  text: string;
}

type ScreenReaderAlertQueue = Array<ScreenReaderAlert>;

const [
  useScreenReaderAlertState,
  changeScreenReaderAlertQueue,
  readScreenReaderAlertQueue,
] = createUseLocalState<ScreenReaderAlertQueue>([]);

const push = (alert: ScreenReaderAlert) => {
  const queue = readScreenReaderAlertQueue();
  queue.push(alert);
  changeScreenReaderAlertQueue([...queue]);
};

const shift = () => {
  const queue = readScreenReaderAlertQueue();
  queue.shift();
  changeScreenReaderAlertQueue([...queue]);
};

const useOlderAlert = () => {
  const state = useScreenReaderAlertState();
  const queue = state[0];
  return queue[0];
};

export {
  push,
  shift,
  useOlderAlert,
};

export default {
  push,
  shift,
  useOlderAlert,
};
