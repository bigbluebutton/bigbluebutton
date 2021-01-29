/**
 * Class used to represent a viewport on screen
 */
export declare class Viewport {
    /** viewport left coordinate */
    x: number;
    /** viewport top coordinate */
    y: number;
    /**viewport width */
    width: number;
    /** viewport height */
    height: number;
    /**
     * Creates a Viewport object located at (x, y) and sized (width, height)
     * @param x defines viewport left coordinate
     * @param y defines viewport top coordinate
     * @param width defines the viewport width
     * @param height defines the viewport height
     */
    constructor(
    /** viewport left coordinate */
    x: number, 
    /** viewport top coordinate */
    y: number, 
    /**viewport width */
    width: number, 
    /** viewport height */
    height: number);
    /**
     * Creates a new viewport using absolute sizing (from 0-> width, 0-> height instead of 0->1)
     * @param renderWidth defines the rendering width
     * @param renderHeight defines the rendering height
     * @returns a new Viewport
     */
    toGlobal(renderWidth: number, renderHeight: number): Viewport;
    /**
     * Stores absolute viewport value into a target viewport (from 0-> width, 0-> height instead of 0->1)
     * @param renderWidth defines the rendering width
     * @param renderHeight defines the rendering height
     * @param ref defines the target viewport
     * @returns the current viewport
     */
    toGlobalToRef(renderWidth: number, renderHeight: number, ref: Viewport): Viewport;
    /**
     * Returns a new Viewport copied from the current one
     * @returns a new Viewport
     */
    clone(): Viewport;
}
