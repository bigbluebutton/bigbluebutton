import createUseLocalState from './createUseLocalState';

const initialPendingChat: string[] = [];
const [useSpeechVoices, setSpeechVoices, localStateSpeechVoices] =
  createUseLocalState<string[]>(initialPendingChat);

export default useSpeechVoices;

export { setSpeechVoices, localStateSpeechVoices };
