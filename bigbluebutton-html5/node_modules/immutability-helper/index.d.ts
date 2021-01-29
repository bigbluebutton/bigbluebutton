// Project: Immutability helper
// TypeScript Version: 2.9

export default update;

declare function update<T, C extends CustomCommands<object> = never>(
  target: T,
  spec: Spec<T, C>,
): T;

declare namespace update {
  function newContext(): typeof update;
  function extend<T>(
    command: string,
    handler: (param: any, old: T) => T,
  ): void;
}

// Usage with custom commands is as follows:
//
//   interface MyCommands {
//     $foo: string;
//   }
//
//    update<Foo, CustomCommands<MyCommands>>(..., { $foo: "bar" });
//
// It is suggested that if you use custom commands frequently, you wrap and re-export a
// properly-typed version of `update`:
//
//   function myUpdate<T>(object: T, spec: Spec<T, CustomCommands<MyCommands>>) {
//     return update(object, spec);
//   }
//
// See https://github.com/kolodny/immutability-helper/pull/108 for explanation of why this
// type exists.
export type CustomCommands<T> = T & { __noInferenceCustomCommandsBrand: any };

export type Spec<T, C extends CustomCommands<object> = never> =
  | (
      T extends (Array<infer U> | ReadonlyArray<infer U>) ? ArraySpec<U, C> :
      T extends (Map<infer K, infer V> | ReadonlyMap<infer K, infer V>) ? MapSpec<K, V> :
      T extends (Set<infer U> | ReadonlySet<infer U>) ? SetSpec<U> :
      T extends object ? ObjectSpec<T, C> :
      never
    )
  | { $set: T }
  | { $apply: (v: T) => T }
  | ((v: T) => T)
  | (C extends CustomCommands<infer O> ? O : never);

type ArraySpec<T, C extends CustomCommands<object>> =
  | { $push: T[] }
  | { $unshift: T[] }
  | { $splice: Array<[number] | [number, number] | [number, number, T]> }
  | { [index: string]: Spec<T, C> }; // Note that this does not type check properly if index: number.

type MapSpec<K, V> =
  | { $add: Array<[K, V]> }
  | { $remove: K[] };

type SetSpec<T> =
  | { $add: T[] }
  | { $remove: T[] };

type ObjectSpec<T, C extends CustomCommands<object>> =
  | { $toggle: Array<keyof T> }
  | { $unset: Array<keyof T> }
  | { $merge: Partial<T> }
  | { [K in keyof T]?: Spec<T[K], C> };
