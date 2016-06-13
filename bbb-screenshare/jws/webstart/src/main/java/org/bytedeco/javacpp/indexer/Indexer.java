/*
 * Copyright (C) 2014-2016 Samuel Audet
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

package org.bytedeco.javacpp.indexer;

import java.nio.Buffer;
import org.bytedeco.javacpp.Pointer;

/**
 * Top-level class of all data indexers, providing easy-to-use and efficient
 * multidimensional access to primitive arrays, NIO buffers, and the raw memory interface.
 * <p>
 * Subclasses have {@code create()} factory methods for arrays, buffers, and pointers.
 * The latter ones feature a {@code direct} argument that, when set to {@code false},
 * instructs the method to create a large enough array, fill its content with the data
 * from the pointer, and return an array-backed indexer, with the {@link #release()}
 * method overridden to write back changes to the pointer. This doubles the memory
 * usage, but is the only way to get acceptable performance on some implementations,
 * such as Android. When {@code direct == true}, the raw memory interface (supporting
 * long indexing) is used if available, and if not a buffer-backed indexer is returned.
 *
 * @see Raw
 *
 * @author Samuel Audet
 */
public abstract class Indexer implements AutoCloseable {

    /** Calls {@link #release()}. */
    @Override public void close() throws Exception {
        release();
    }

    /**
     * The number of elements in each dimension.
     * These values are not typically used by the indexer.
     */
    protected long[] sizes;
    /**
     * The number of elements to skip to reach the next element in a given dimension.
     * {@code strides[i] > strides[i + 1] && strides[strides.length - 1] == 1} must hold.
     */
    protected long[] strides;

    /** Constructor to set the {@link #sizes} and {@link #strides}. */
    protected Indexer(long[] sizes, long[] strides) {
        this.sizes = sizes;
        this.strides = strides;
    }

    /** Returns {@link #sizes} */
    public long[] sizes() { return sizes; }
    /** Returns {@link #strides} */
    public long[] strides() { return strides; }

    /** Returns {@code sizes[0]} */
    public long rows() { return sizes[0]; }
    /** Returns {@code sizes[1]} */
    public long cols() { return sizes[1]; }

    /** Returns {@code sizes[1]} */
    public long width() { return sizes[1]; }
    /** Returns {@code sizes[0]} */
    public long height() { return sizes[0]; }
    /** Returns {@code sizes[2]} */
    public long channels() { return sizes[2]; }

    protected static final long checkIndex(long i, long size) {
        if (i < 0 || i >= size) {
            throw new IndexOutOfBoundsException(Long.toString(i));
        }
        return i;
    }

    /**
     * Computes the linear index as the dot product of indices and strides.
     *
     * @param indices of each dimension
     * @return index to access array or buffer
     */
    public long index(long... indices) {
        long index = 0;
        for (int i = 0; i < indices.length && i < strides.length; i++) {
            index += indices[i] * strides[i];
        }
        return index;
    }

    /** Returns the backing array, or {@code null} if none */
    public Object array() { return null; }
    /** Returns the backing buffer, or {@code null} if none */
    public Buffer buffer() { return null; }
    /** Returns the backing pointer, or {@code null} if none */
    public Pointer pointer() { return null; }
    /** Makes sure changes are reflected onto the backing memory and clears any references. */
    public abstract void release();

    /** Calls {@code get(int...indices)} and returns the value as a double. */
    public abstract double getDouble(long... indices);
    /** Casts value to primitive type and calls {@code put(long[] indices, <type> value)}. */
    public abstract Indexer putDouble(long[] indices, double value);

    @Override public String toString() {
        long rows     = sizes.length > 0 ? sizes[0] : 1,
             cols     = sizes.length > 1 ? sizes[1] : 1,
             channels = sizes.length > 2 ? sizes[2] : 1;
        StringBuilder s = new StringBuilder(rows > 1 ? "\n[ " : "[ ");
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (channels > 1) {
                    s.append("(");
                }
                for (int k = 0; k < channels; k++) {
                    double v = getDouble(i, j, k);
                    s.append((float)v);
                    if (k < channels - 1) {
                        s.append(", ");
                    }
                }
                if (channels > 1) {
                    s.append(")");
                }
                if (j < cols - 1) {
                    s.append(", ");
                }
            }
            if (i < rows - 1) {
                s.append("\n  ");
            }
        }
        s.append(" ]");
        return s.toString();
    }
}
