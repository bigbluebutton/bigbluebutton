const MAX_CHAR_LENGTH = 5;

export const shouldStackOptions = (keys: Array<string>) => keys.some((k) => k.length > MAX_CHAR_LENGTH);

export default { shouldStackOptions };
