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

import java.nio.DoubleBuffer;
import org.bytedeco.javacpp.DoublePointer;

/**
 * Abstract indexer for the {@code double} primitive type.
 *
 * @author Samuel Audet
 */
public abstract class DoubleIndexer extends Indexer {
    /** The number of bytes used to represent a double. */
    public static final int VALUE_BYTES = 8;

    protected DoubleIndexer(long[] sizes, long[] strides) {
        super(sizes, strides);
    }

    /** Returns {@code new DoubleArrayIndexer(array)} */
    public static DoubleIndexer create(double[] array) {
        return new DoubleArrayIndexer(array);
    }
    /** Returns {@code new DoubleBufferIndexer(buffer)} */
    public static DoubleIndexer create(DoubleBuffer buffer) {
        return new DoubleBufferIndexer(buffer);
    }
    /** Returns {@code create(pointer, { pointer.limit() - pointer.position() }, { 1 }, true)} */
    public static DoubleIndexer create(DoublePointer pointer) {
        return create(pointer, new long[] { pointer.limit() - pointer.position() }, new long[] { 1 });
    }

    /** Returns {@code new DoubleArrayIndexer(array, sizes, strides)} */
    public static DoubleIndexer create(double[] array, long[] sizes, long[] strides) {
        return new DoubleArrayIndexer(array, sizes, strides);
    }
    /** Returns {@code new DoubleBufferIndexer(buffer, sizes, strides)} */
    public static DoubleIndexer create(DoubleBuffer buffer, long[] sizes, long[] strides) {
        return new DoubleBufferIndexer(buffer, sizes, strides);
    }
    /** Returns {@code create(pointer, sizes, strides, true)} */
    public static DoubleIndexer create(DoublePointer pointer, long[] sizes, long[] strides) {
        return create(pointer, sizes, strides, true);
    }
    /**
     * Creates a double indexer to access efficiently the data of a pointer.
     *
     * @param pointer data to access via a buffer or to copy to an array
     * @param direct {@code true} to use a direct buffer, see {@link Indexer} for details
     * @return the new double indexer backed by the raw memory interface, a buffer, or an array
     */
    public static DoubleIndexer create(final DoublePointer pointer, long[] sizes, long[] strides, boolean direct) {
        if (direct) {
            return Raw.getInstance() != null ? new DoubleRawIndexer(pointer, sizes, strides)
                                             : new DoubleBufferIndexer(pointer.asBuffer(), sizes, strides);
        } else {
            final long position = pointer.position();
            double[] array = new double[(int)Math.min(pointer.limit() - position, Integer.MAX_VALUE)];
            pointer.get(array);
            return new DoubleArrayIndexer(array, sizes, strides) {
                @Override public void release() {
                    pointer.position(position).put(array);
                    super.release();
                }
            };
        }
    }

    /** Returns {@code array/buffer[i]} */
    public abstract double get(long i);
    /** Returns {@code this} where {@code d = array/buffer[i]} */
    public DoubleIndexer get(long i, double[] d) { return get(i, d, 0, d.length); }
    /** Returns {@code this} where {@code d[offset:offset + length] = array/buffer[i]} */
    public abstract DoubleIndexer get(long i, double[] d, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j]} */
    public abstract double get(long i, long j);
    /** Returns {@code this} where {@code d = array/buffer[i * strides[0] + j]} */
    public DoubleIndexer get(long i, long j, double[] d) { return get(i, j, d, 0, d.length); }
    /** Returns {@code this} where {@code d[offset:offset + length] = array/buffer[i * strides[0] + j]} */
    public abstract DoubleIndexer get(long i, long j, double[] d, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j * strides[1] + k]} */
    public abstract double get(long i, long j, long k);
    /** Returns {@code array/buffer[index(indices)]} */
    public abstract double get(long... indices);
    /** Returns {@code this} where {@code d = array/buffer[index(indices)]} */
    public DoubleIndexer get(long[] indices, double[] d) { return get(indices, d, 0, d.length); }
    /** Returns {@code this} where {@code d[offset:offset + length] = array/buffer[index(indices)]} */
    public abstract DoubleIndexer get(long[] indices, double[] d, int offset, int length);

    /** Returns {@code this} where {@code array/buffer[i] = d} */
    public abstract DoubleIndexer put(long i, double d);
    /** Returns {@code this} where {@code array/buffer[i] = d} */
    public DoubleIndexer put(long i, double... d) { return put(i, d, 0, d.length); }
    /** Returns {@code this} where {@code array/buffer[i] = d[offset:offset + length]} */
    public abstract DoubleIndexer put(long i, double[] d, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = d} */
    public abstract DoubleIndexer put(long i, long j, double d);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = d} */
    public DoubleIndexer put(long i, long j, double... d) { return put(i, j, d, 0, d.length); }
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = d[offset:offset + length]} */
    public abstract DoubleIndexer put(long i, long j, double[] d, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j * strides[1] + k] = d} */
    public abstract DoubleIndexer put(long i, long j, long k, double d);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = d} */
    public abstract DoubleIndexer put(long[] indices, double d);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = d} */
    public DoubleIndexer put(long[] indices, double... d) { return put(indices, d, 0, d.length); }
    /** Returns {@code this} where {@code array/buffer[index(indices)] = d[offset:offset + length]} */
    public abstract DoubleIndexer put(long[] indices, double[] d, int offset, int length);

    @Override public double getDouble(long... indices) { return get(indices); }
    @Override public DoubleIndexer putDouble(long[] indices, double d) { return put(indices, d); }
}
