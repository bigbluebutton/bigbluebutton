import createUseLocalState from './createUseLocalState';

const initialPendingChats: string[] = [];
const [usePendingChats, setPendingChats] = createUseLocalState<string[]>(initialPendingChats);

export default usePendingChats;
export { setPendingChats };
