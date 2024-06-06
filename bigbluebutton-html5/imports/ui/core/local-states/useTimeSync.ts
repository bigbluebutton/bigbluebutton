import createUseLocalState from './createUseLocalState';

const initialPendingChat: number = 0;
const [useTimeSync, setTimeSync] = createUseLocalState<number>(initialPendingChat);

export default useTimeSync;
export { setTimeSync };
