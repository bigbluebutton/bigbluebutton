/**
 * Interface for the size containing width and height
 */
export interface ISize {
    /**
     * Width
     */
    width: number;
    /**
     * Heighht
     */
    height: number;
}
/**
 * Size containing widht and height
 */
export declare class Size implements ISize {
    /**
     * Width
     */
    width: number;
    /**
     * Height
     */
    height: number;
    /**
     * Creates a Size object from the given width and height (floats).
     * @param width width of the new size
     * @param height height of the new size
     */
    constructor(width: number, height: number);
    /**
     * Returns a string with the Size width and height
     * @returns a string with the Size width and height
     */
    toString(): string;
    /**
     * "Size"
     * @returns the string "Size"
     */
    getClassName(): string;
    /**
     * Returns the Size hash code.
     * @returns a hash code for a unique width and height
     */
    getHashCode(): number;
    /**
     * Updates the current size from the given one.
     * @param src the given size
     */
    copyFrom(src: Size): void;
    /**
     * Updates in place the current Size from the given floats.
     * @param width width of the new size
     * @param height height of the new size
     * @returns the updated Size.
     */
    copyFromFloats(width: number, height: number): Size;
    /**
     * Updates in place the current Size from the given floats.
     * @param width width to set
     * @param height height to set
     * @returns the updated Size.
     */
    set(width: number, height: number): Size;
    /**
     * Multiplies the width and height by numbers
     * @param w factor to multiple the width by
     * @param h factor to multiple the height by
     * @returns a new Size set with the multiplication result of the current Size and the given floats.
     */
    multiplyByFloats(w: number, h: number): Size;
    /**
     * Clones the size
     * @returns a new Size copied from the given one.
     */
    clone(): Size;
    /**
     * True if the current Size and the given one width and height are strictly equal.
     * @param other the other size to compare against
     * @returns True if the current Size and the given one width and height are strictly equal.
     */
    equals(other: Size): boolean;
    /**
     * The surface of the Size : width * height (float).
     */
    get surface(): number;
    /**
     * Create a new size of zero
     * @returns a new Size set to (0.0, 0.0)
     */
    static Zero(): Size;
    /**
     * Sums the width and height of two sizes
     * @param otherSize size to add to this size
     * @returns a new Size set as the addition result of the current Size and the given one.
     */
    add(otherSize: Size): Size;
    /**
     * Subtracts the width and height of two
     * @param otherSize size to subtract to this size
     * @returns a new Size set as the subtraction result of  the given one from the current Size.
     */
    subtract(otherSize: Size): Size;
    /**
     * Creates a new Size set at the linear interpolation "amount" between "start" and "end"
     * @param start starting size to lerp between
     * @param end end size to lerp between
     * @param amount amount to lerp between the start and end values
     * @returns a new Size set at the linear interpolation "amount" between "start" and "end"
     */
    static Lerp(start: Size, end: Size, amount: number): Size;
}
