import createUseLocalState from './createUseLocalState';

const initialPresentationSwap: boolean = false;
const [usePresentationSwap, setShowScreenshare] = createUseLocalState<boolean>(initialPresentationSwap);

export default usePresentationSwap;
export { setShowScreenshare };
