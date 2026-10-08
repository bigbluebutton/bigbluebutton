// Floor fields change on every talk turn but only feed stream sorting and the
// privileged-stream pick upstream; nothing in the video list renders them.
const FLOOR_KEYS = ['floor', 'lastFloorTime'];

const isPlainValue = (value: object) => Array.isArray(value)
  || Object.getPrototypeOf(value) === Object.prototype
  || Object.getPrototypeOf(value) === null;

const isEqualIgnoringFloor = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  // Items are plain JSON; anything else (a Date, a track) only matches by identity.
  if (!isPlainValue(a) || !isPlainValue(b) || Array.isArray(a) !== Array.isArray(b)) return false;

  const recordA = a as Record<string, unknown>;
  const recordB = b as Record<string, unknown>;
  const keysA = Object.keys(recordA).filter((key) => !FLOOR_KEYS.includes(key));
  const keysB = Object.keys(recordB).filter((key) => !FLOOR_KEYS.includes(key));

  return keysA.length === keysB.length
    && keysA.every((key) => Object.prototype.hasOwnProperty.call(recordB, key)
      && isEqualIgnoringFloor(recordA[key], recordB[key]));
};

// React.memo's shallow comparison, except for the video item props: the stream
// hooks rebuild those objects on every pass, so they are compared by value.
const propsEqualIgnoringFloor = <P extends object>(itemKeys: (keyof P)[]) => (
  prev: Readonly<P>,
  next: Readonly<P>,
): boolean => {
  const keys = Object.keys(next) as (keyof P)[];

  return keys.length === Object.keys(prev).length
    && keys.every((key) => (itemKeys.includes(key)
      ? isEqualIgnoringFloor(prev[key], next[key])
      : Object.is(prev[key], next[key])));
};

export default propsEqualIgnoringFloor;
