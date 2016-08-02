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

import org.bytedeco.javacpp.annotation.Cast;
import org.bytedeco.javacpp.annotation.Name;

/**
 * The peer class to native pointers and arrays of {@code size_t}.
 * All operations take into account the position and limit, when appropriate.
 * <p>
 * We need this class because the size differs between 32-bit and 64-bit platforms.
 *
 * @author Samuel Audet
 */
@Name("size_t")
public class SizeTPointer extends Pointer {
    /**
     * Allocates a native {@code size_t} array of the given size.
     *
     * @param size the number of {@code size_t} elements to allocate
     */
    public SizeTPointer(long size) {
        try {
            allocateArray(size);
        } catch (UnsatisfiedLinkError e) {
            throw new RuntimeException("No native JavaCPP library in memory. (Has Loader.load() been called?)", e);
        }
    }
    /** @see Pointer#Pointer() */
    public SizeTPointer() { }
    /** @see Pointer#Pointer(Pointer) */
    public SizeTPointer(Pointer p) { super(p); }
    private native void allocateArray(long size);

    /** @see Pointer#position(long) */
    @Override public SizeTPointer position(long position) {
        return super.position(position);
    }
    /** @see Pointer#limit(long) */
    @Override public SizeTPointer limit(long limit) {
        return super.limit(limit);
    }
    /** @see Pointer#capacity(long) */
    @Override public SizeTPointer capacity(long capacity) {
        return super.capacity(capacity);
    }

    /** @return {@code get(0)} */
    public long get() { return get(0); }
    /** @return the i-th {@code size_t} value of a native array */
    @Cast("size_t") public native long get(long i);
    /** @return {@code put(0, s)} */
    public SizeTPointer put(long s) { return put(0, s); }
    /**
     * Copies the {@code size_t} value to the i-th element of a native array.
     *
     * @param i the index into the array
     * @param s the {@code size_t} value to copy
     * @return this
     */
    public native SizeTPointer put(long i, long s);
}
