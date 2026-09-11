import { environment } from '../environment.mjs';

export const useStorageKey = () => environment.audioModalIsOpen;
export default { useStorageKey };
