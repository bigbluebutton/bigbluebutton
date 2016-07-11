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

import java.nio.ShortBuffer;
import org.bytedeco.javacpp.ShortPointer;

/**
 * Abstract indexer for the {@code short} primitive type.
 *
 * @author Samuel Audet
 */
public abstract class ShortIndexer extends Indexer {
    /** The number of bytes used to represent a short. */
    public static final int VALUE_BYTES = 2;

    protected ShortIndexer(long[] sizes, long[] strides) {
        super(sizes, strides);
    }

    /** Returns {@code new ShortArrayIndexer(array)} */
    public static ShortIndexer create(short[] array) {
        return new ShortArrayIndexer(array);
    }
    /** Returns {@code new ShortBufferIndexer(buffer)} */
    public static ShortIndexer create(ShortBuffer buffer) {
        return new ShortBufferIndexer(buffer);
    }
    /** Returns {@code create(pointer, { pointer.limit() - pointer.position() }, { 1 }, true)} */
    public static ShortIndexer create(ShortPointer pointer) {
        return create(pointer, new long[] { pointer.limit() - pointer.position() }, new long[] { 1 });
    }

    /** Returns {@code new ShortArrayIndexer(array, sizes, strides)} */
    public static ShortIndexer create(short[] array, long[] sizes, long[] strides) {
        return new ShortArrayIndexer(array, sizes, strides);
    }
    /** Returns {@code new ShortBufferIndexer(buffer, sizes, strides)} */
    public static ShortIndexer create(ShortBuffer buffer, long[] sizes, long[] strides) {
        return new ShortBufferIndexer(buffer, sizes, strides);
    }
    /** Returns {@code create(pointer, sizes, strides, true)} */
    public static ShortIndexer create(ShortPointer pointer, long[] sizes, long[] strides) {
        return create(pointer, sizes, strides, true);
    }
    /**
     * Creates a short indexer to access efficiently the data of a pointer.
     *
     * @param pointer data to access via a buffer or to copy to an array
     * @param direct {@code true} to use a direct buffer, see {@link Indexer} for details
     * @return the new short indexer backed by the raw memory interface, a buffer, or an array
     */
    public static ShortIndexer create(final ShortPointer pointer, long[] sizes, long[] strides, boolean direct) {
        if (direct) {
            return Raw.getInstance() != null ? new ShortRawIndexer(pointer, sizes, strides)
                                             : new ShortBufferIndexer(pointer.asBuffer(), sizes, strides);
        } else {
            final long position = pointer.position();
            short[] array = new short[(int)Math.min(pointer.limit() - position, Integer.MAX_VALUE)];
            pointer.get(array);
            return new ShortArrayIndexer(array, sizes, strides) {
                @Override public void release() {
                    pointer.position(position).put(array);
                    super.release();
                }
            };
        }
    }

    /** Returns {@code array/buffer[i]} */
    public abstract short get(long i);
    /** Returns {@code this} where {@code s = array/buffer[i]} */
    public ShortIndexer get(long i, short[] s) { return get(i, s, 0, s.length); }
    /** Returns {@code this} where {@code s[offset:offset + length] = array/buffer[i]} */
    public abstract ShortIndexer get(long i, short[] s, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j]} */
    public abstract short get(long i, long j);
    /** Returns {@code this} where {@code s = array/buffer[i * strides[0] + j]} */
    public ShortIndexer get(long i, long j, short[] s) { return get(i, j, s, 0, s.length); }
    /** Returns {@code this} where {@code s[offset:offset + length] = array/buffer[i * strides[0] + j]} */
    public abstract ShortIndexer get(long i, long j, short[] s, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j * strides[1] + k]} */
    public abstract short get(long i, long j, long k);
    /** Returns {@code array/buffer[index(indices)]} */
    public abstract short get(long... indices);
    /** Returns {@code this} where {@code s = array/buffer[index(indices)]} */
    public ShortIndexer get(long[] indices, short[] s) { return get(indices, s, 0, s.length); }
    /** Returns {@code this} where {@code s[offset:offset + length] = array/buffer[index(indices)]} */
    public abstract ShortIndexer get(long[] indices, short[] s, int offset, int length);

    /** Returns {@code this} where {@code array/buffer[i] = s} */
    public abstract ShortIndexer put(long i, short s);
    /** Returns {@code this} where {@code array/buffer[i] = s} */
    public ShortIndexer put(long i, short... s) { return put(i, s, 0, s.length); }
    /** Returns {@code this} where {@code array/buffer[i] = s[offset:offset + length]} */
    public abstract ShortIndexer put(long i, short[] s, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = s} */
    public abstract ShortIndexer put(long i, long j, short s);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = s} */
    public ShortIndexer put(long i, long j, short... s) { return put(i, j, s, 0, s.length); }
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = s[offset:offset + length]} */
    public abstract ShortIndexer put(long i, long j, short[] s, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j * strides[1] + k] = s} */
    public abstract ShortIndexer put(long i, long j, long k, short s);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = s} */
    public abstract ShortIndexer put(long[] indices, short s);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = s} */
    public ShortIndexer put(long[] indices, short... s) { return put(indices, s, 0, s.length); }
    /** Returns {@code this} where {@code array/buffer[index(indices)] = s[offset:offset + length]} */
    public abstract ShortIndexer put(long[] indices, short[] s, int offset, int length);

    @Override public double getDouble(long... indices) { return get(indices); }
    @Override public ShortIndexer putDouble(long[] indices, double s) { return put(indices, (short)s); }
}
