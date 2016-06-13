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
 * The peer class to native pointers and arrays of {@code long}.
 * All operations take into account the position and limit, when appropriate.
 * <p>
 * We need this class because platforms supported by Java do not all agree on the
 * size of the native C++ {@code long} type, unlike {@code int} and {@code short}.
 *
 * @author Samuel Audet
 */
@Name("long")
public class CLongPointer extends Pointer {
    /**
     * Allocates a native {@code long} array of the given size.
     *
     * @param size the number of {@code long} elements to allocate
     */
    public CLongPointer(long size) {
        try {
            allocateArray(size);
        } catch (UnsatisfiedLinkError e) {
            throw new RuntimeException("No native JavaCPP library in memory. (Has Loader.load() been called?)", e);
        }
    }
    /** @see Pointer#Pointer() */
    public CLongPointer() { }
    /** @see Pointer#Pointer(Pointer) */
    public CLongPointer(Pointer p) { super(p); }
    private native void allocateArray(long size);

    /** @see Pointer#position(long) */
    @Override public CLongPointer position(long position) {
        return super.position(position);
    }
    /** @see Pointer#limit(long) */
    @Override public CLongPointer limit(long limit) {
        return super.limit(limit);
    }
    /** @see Pointer#capacity(long) */
    @Override public CLongPointer capacity(long capacity) {
        return super.capacity(capacity);
    }

    /** @return {@code get(0)} */
    public long get() { return get(0); }
    /** @return the i-th {@code long} value of a native array */
    @Cast("long") public native long get(long i);
    /** @return {@code put(0, l)} */
    public CLongPointer put(long l) { return put(0, l); }
    /**
     * Copies the {@code long} value to the i-th element of a native array.
     *
     * @param i the index into the array
     * @param l the {@code long} value to copy
     * @return this
     */
    public native CLongPointer put(long i, long l);
}
