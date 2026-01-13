import createUseLocalState from './createUseLocalState';

const initialPendingSync: number = 0;
const [useTimeSync, setTimeSync] = createUseLocalState<number>(initialPendingSync);

export default useTimeSync;
export { setTimeSync };
