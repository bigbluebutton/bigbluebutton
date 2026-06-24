export function toBoolean(str?: string) {
  return !!str && str.toLocaleLowerCase() === 'true';
}
