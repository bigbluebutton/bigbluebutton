import { FloatArray, Nullable, IndicesArray } from '../types';
import { Vector2, Vector3 } from './math.vector';
/**
 * Extracts minimum and maximum values from a list of indexed positions
 * @param positions defines the positions to use
 * @param indices defines the indices to the positions
 * @param indexStart defines the start index
 * @param indexCount defines the end index
 * @param bias defines bias value to add to the result
 * @return minimum and maximum values
 */
export declare function extractMinAndMaxIndexed(positions: FloatArray, indices: IndicesArray, indexStart: number, indexCount: number, bias?: Nullable<Vector2>): {
    minimum: Vector3;
    maximum: Vector3;
};
/**
 * Extracts minimum and maximum values from a list of positions
 * @param positions defines the positions to use
 * @param start defines the start index in the positions array
 * @param count defines the number of positions to handle
 * @param bias defines bias value to add to the result
 * @param stride defines the stride size to use (distance between two positions in the positions array)
 * @return minimum and maximum values
 */
export declare function extractMinAndMax(positions: FloatArray, start: number, count: number, bias?: Nullable<Vector2>, stride?: number): {
    minimum: Vector3;
    maximum: Vector3;
};
