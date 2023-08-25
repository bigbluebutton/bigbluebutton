import createUseLocalState from './createUseLocalState';

const initialPendingChat: Array<string> = [];
const [
  useSelfViewDisable,
  setSelfViewDisable,
] = createUseLocalState<Array<string>>(initialPendingChat);

export default useSelfViewDisable;
export { setSelfViewDisable };
