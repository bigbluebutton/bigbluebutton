/** Alias type for value that can be null */
export declare type Nullable<T> = T | null;
/**
 * Alias type for number that are floats
 * @ignorenaming
 */
export declare type float = number;
/**
 * Alias type for number that are doubles.
 * @ignorenaming
 */
export declare type double = number;
/**
 * Alias type for number that are integer
 * @ignorenaming
 */
export declare type int = number;
/** Alias type for number array or Float32Array */
export declare type FloatArray = number[] | Float32Array;
/** Alias type for number array or Float32Array or Int32Array or Uint32Array or Uint16Array */
export declare type IndicesArray = number[] | Int32Array | Uint32Array | Uint16Array;
/**
 * Alias for types that can be used by a Buffer or VertexBuffer.
 */
export declare type DataArray = number[] | ArrayBuffer | ArrayBufferView;
/**
 * Alias type for primitive types
 * @ignorenaming
 */
declare type Primitive = undefined | null | boolean | string | number | Function;
/**
 * Type modifier to make all the properties of an object Readonly
 */
export declare type Immutable<T> = T extends Primitive ? T : T extends Array<infer U> ? ReadonlyArray<U> : DeepImmutable<T>;
/**
 * Type modifier to make all the properties of an object Readonly recursively
 */
export declare type DeepImmutable<T> = T extends Primitive ? T : T extends Array<infer U> ? DeepImmutableArray<U> : DeepImmutableObject<T>;
/**
 * Type modifier to make object properties readonly.
 */
export declare type DeepImmutableObject<T> = {
    readonly [K in keyof T]: DeepImmutable<T[K]>;
};
/** @hidden */
interface DeepImmutableArray<T> extends ReadonlyArray<DeepImmutable<T>> {
}
export {};
/** @hidden */
