/*
 * Copyright (C) 2011-2016 Samuel Audet
 *
 * Licensed either under the Apache License, Version 2.0, or (at your option)
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation (subject to the "Classpath" exception),
 * either version 2, or any later version (collectively, the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/software/classpath/license.html
 *
 * or as provided in the LICENSE.txt file that accompanied this code.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bytedeco.javacpp;

import java.nio.DoubleBuffer;

/**
 * The peer class to native pointers and arrays of {@code double}.
 * All operations take into account the position and limit, when appropriate.
 *
 * @author Samuel Audet
 */
public class DoublePointer extends Pointer {
    /**
     * Allocates enough memory for the array and copies it.
     *
     * @param array the array to copy
     * @see #put(double[])
     */
    public DoublePointer(double ... array) {
        this(array.length);
        put(array);
    }
    /**
     * For direct buffers, calls {@link Pointer#Pointer(Buffer)}, while for buffers
     * backed with an array, allocates enough memory for the array and copies it.
     *
     * @param buffer the Buffer to reference or copy
     * @see #put(double[])
     */
    public DoublePointer(DoubleBuffer buffer) {
        super(buffer);
        if (buffer != null && buffer.hasArray()) {
            double[] array = buffer.array();
            allocateArray(array.length - buffer.arrayOffset());
            put(array, buffer.arrayOffset(), array.length - buffer.arrayOffset());
            position(buffer.position());
            limit(buffer.limit());
        }
    }
    /**
     * Allocates a native {@code double} array of the given size.
     *
     * @param size the number of {@code double} elements to allocate
     */
    public DoublePointer(long size) {
        try {
            allocateArray(size);
        } catch (UnsatisfiedLinkError e) {
            throw new RuntimeException("No native JavaCPP library in memory. (Has Loader.load() been called?)", e);
        }
    }
    /** @see Pointer#Pointer() */
    public DoublePointer() { }
    /** @see Pointer#Pointer(Pointer) */
    public DoublePointer(Pointer p) { super(p); }
    private native void allocateArray(long size);

    /** @see Pointer#position(long) */
    @Override public DoublePointer position(long position) {
        return super.position(position);
    }
    /** @see Pointer#limit(long) */
    @Override public DoublePointer limit(long limit) {
        return super.limit(limit);
    }
    /** @see Pointer#capacity(long) */
    @Override public DoublePointer capacity(long capacity) {
        return super.capacity(capacity);
    }

    /** @return {@code get(0)} */
    public double get() { return get(0); }
    /** @return the i-th {@code double} value of a native array */
    public native double get(long i);
    /** @return {@code put(0, d)} */
    public DoublePointer put(double d) { return put(0, d); }
    /**
     * Copies the {@code double} value to the i-th element of a native array.
     *
     * @param i the index into the array
     * @param d the {@code double} value to copy
     * @return this
     */
    public native DoublePointer put(long i, double d);

    /** @return {@code get(array, 0, array.length)} */
    public DoublePointer get(double[] array) { return get(array, 0, array.length); }
    /** @return {@code put(array, 0, array.length)} */
    public DoublePointer put(double ... array) { return put(array, 0, array.length); }
    /**
     * Reads a portion of the native array into a Java array.
     *
     * @param array the array to write to
     * @param offset the offset into the array where to start writing
     * @param length the length of data to read and write
     * @return this
     */
    public native DoublePointer get(double[] array, int offset, int length);
    /**
     * Writes a portion of a Java array into the native array.
     *
     * @param array the array to read from
     * @param offset the offset into the array where to start reading
     * @param length the length of data to read and write
     * @return this
     */
    public native DoublePointer put(double[] array, int offset, int length);

    /** @return {@code asByteBuffer().asDoubleBuffer()} */
    @Override public final DoubleBuffer asBuffer() {
        return asByteBuffer().asDoubleBuffer();
    }
}
