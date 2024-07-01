import createUseLocalState from './createUseLocalState';

const initialLocale: string = navigator.languages
  ? navigator.languages[0] : navigator.language;
const [useCurrentLocale, setUseCurrentLocale] = createUseLocalState<string>(initialLocale);

export default useCurrentLocale;
export { setUseCurrentLocale };
