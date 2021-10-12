import { OperatorFunction, MonoTypeOperatorFunction, Falsy } from '../types';
export declare function takeWhile<T>(predicate: BooleanConstructor): OperatorFunction<T, Exclude<T, Falsy> extends never ? never : T>;
export declare function takeWhile<T>(predicate: BooleanConstructor, inclusive: false): OperatorFunction<T, Exclude<T, Falsy> extends never ? never : T>;
export declare function takeWhile<T>(predicate: BooleanConstructor, inclusive: true): MonoTypeOperatorFunction<T>;
export declare function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export declare function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S, inclusive: false): OperatorFunction<T, S>;
export declare function takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean): MonoTypeOperatorFunction<T>;
//# sourceMappingURL=takeWhile.d.ts.map