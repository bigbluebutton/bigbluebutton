import { Matrix } from './math.vector';
import { DeepImmutable } from '../types';
import { Plane } from './math.plane';
/**
 * Represents a camera frustum
 */
export declare class Frustum {
    /**
     * Gets the planes representing the frustum
     * @param transform matrix to be applied to the returned planes
     * @returns a new array of 6 Frustum planes computed by the given transformation matrix.
     */
    static GetPlanes(transform: DeepImmutable<Matrix>): Plane[];
    /**
     * Gets the near frustum plane transformed by the transform matrix
     * @param transform transformation matrix to be applied to the resulting frustum plane
     * @param frustumPlane the resuling frustum plane
     */
    static GetNearPlaneToRef(transform: DeepImmutable<Matrix>, frustumPlane: Plane): void;
    /**
     * Gets the far frustum plane transformed by the transform matrix
     * @param transform transformation matrix to be applied to the resulting frustum plane
     * @param frustumPlane the resuling frustum plane
     */
    static GetFarPlaneToRef(transform: DeepImmutable<Matrix>, frustumPlane: Plane): void;
    /**
     * Gets the left frustum plane transformed by the transform matrix
     * @param transform transformation matrix to be applied to the resulting frustum plane
     * @param frustumPlane the resuling frustum plane
     */
    static GetLeftPlaneToRef(transform: DeepImmutable<Matrix>, frustumPlane: Plane): void;
    /**
     * Gets the right frustum plane transformed by the transform matrix
     * @param transform transformation matrix to be applied to the resulting frustum plane
     * @param frustumPlane the resuling frustum plane
     */
    static GetRightPlaneToRef(transform: DeepImmutable<Matrix>, frustumPlane: Plane): void;
    /**
     * Gets the top frustum plane transformed by the transform matrix
     * @param transform transformation matrix to be applied to the resulting frustum plane
     * @param frustumPlane the resuling frustum plane
     */
    static GetTopPlaneToRef(transform: DeepImmutable<Matrix>, frustumPlane: Plane): void;
    /**
     * Gets the bottom frustum plane transformed by the transform matrix
     * @param transform transformation matrix to be applied to the resulting frustum plane
     * @param frustumPlane the resuling frustum plane
     */
    static GetBottomPlaneToRef(transform: DeepImmutable<Matrix>, frustumPlane: Plane): void;
    /**
     * Sets the given array "frustumPlanes" with the 6 Frustum planes computed by the given transformation matrix.
     * @param transform transformation matrix to be applied to the resulting frustum planes
     * @param frustumPlanes the resuling frustum planes
     */
    static GetPlanesToRef(transform: DeepImmutable<Matrix>, frustumPlanes: Plane[]): void;
}
