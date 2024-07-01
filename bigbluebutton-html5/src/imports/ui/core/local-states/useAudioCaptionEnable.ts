import createUseLocalState from './createUseLocalState';

const initialAudioCaptionEnable: boolean = false;
const [useAudioCaptionEnable, setAudioCaptionEnable] = createUseLocalState<boolean>(initialAudioCaptionEnable);

export default useAudioCaptionEnable;
export { setAudioCaptionEnable };
