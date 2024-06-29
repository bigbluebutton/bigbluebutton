import createUseLocalState from './createUseLocalState';

const initialPendingChat: string = '';
const [usePendingChat, setPendingChat] = createUseLocalState<string>(initialPendingChat);

export default usePendingChat;
export { setPendingChat };
