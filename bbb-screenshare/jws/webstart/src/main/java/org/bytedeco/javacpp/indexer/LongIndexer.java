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

import java.nio.LongBuffer;
import org.bytedeco.javacpp.LongPointer;

/**
 * Abstract indexer for the {@code long} primitive type.
 *
 * @author Samuel Audet
 */
public abstract class LongIndexer extends Indexer {
    /** The number of bytes used to represent a long. */
    public static final int VALUE_BYTES = 8;

    protected LongIndexer(long[] sizes, long[] strides) {
        super(sizes, strides);
    }

    /** Returns {@code new LongArrayIndexer(array)} */
    public static LongIndexer create(long[] array) {
        return new LongArrayIndexer(array);
    }
    /** Returns {@code new LongBufferIndexer(buffer)} */
    public static LongIndexer create(LongBuffer buffer) {
        return new LongBufferIndexer(buffer);
    }
    /** Returns {@code create(pointer, { pointer.limit() - pointer.position() }, { 1 }, true)} */
    public static LongIndexer create(LongPointer pointer) {
        return create(pointer, new long[] { pointer.limit() - pointer.position() }, new long[] { 1 });
    }

    /** Returns {@code new LongArrayIndexer(array, sizes, strides)} */
    public static LongIndexer create(long[] array, long[] sizes, long[] strides) {
        return new LongArrayIndexer(array, sizes, strides);
    }
    /** Returns {@code new LongBufferIndexer(buffer, sizes, strides)} */
    public static LongIndexer create(LongBuffer buffer, long[] sizes, long[] strides) {
        return new LongBufferIndexer(buffer, sizes, strides);
    }
    /** Returns {@code create(pointer, sizes, strides, true)} */
    public static LongIndexer create(LongPointer pointer, long[] sizes, long[] strides) {
        return create(pointer, sizes, strides, true);
    }
    /**
     * Creates a long indexer to access efficiently the data of a pointer.
     *
     * @param pointer data to access via a buffer or to copy to an array
     * @param direct {@code true} to use a direct buffer, see {@link Indexer} for details
     * @return the new long indexer backed by the raw memory interface, a buffer, or an array
     */
    public static LongIndexer create(final LongPointer pointer, long[] sizes, long[] strides, boolean direct) {
        if (direct) {
            return Raw.getInstance() != null ? new LongRawIndexer(pointer, sizes, strides)
                                             : new LongBufferIndexer(pointer.asBuffer(), sizes, strides);
        } else {
            final long position = pointer.position();
            long[] array = new long[(int)Math.min(pointer.limit() - position, Integer.MAX_VALUE)];
            pointer.get(array);
            return new LongArrayIndexer(array, sizes, strides) {
                @Override public void release() {
                    pointer.position(position).put(array);
                    super.release();
                }
            };
        }
    }

    /** Returns {@code array/buffer[i]} */
    public abstract long get(long i);
    /** Returns {@code this} where {@code l = array/buffer[i]} */
    public LongIndexer get(long i, long[] l) { return get(i, l, 0, l.length); }
    /** Returns {@code this} where {@code l[offset:offset + length] = array/buffer[i]} */
    public abstract LongIndexer get(long i, long[] l, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j]} */
    public abstract long get(long i, long j);
    /** Returns {@code this} where {@code l = array/buffer[i * strides[0] + j]} */
    public LongIndexer get(long i, long j, long[] l) { return get(i, j, l, 0, l.length); }
    /** Returns {@code this} where {@code l[offset:offset + length] = array/buffer[i * strides[0] + j]} */
    public abstract LongIndexer get(long i, long j, long[] l, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j * strides[1] + k]} */
    public abstract long get(long i, long j, long k);
    /** Returns {@code array/buffer[index(indices)]} */
    public abstract long get(long... indices);
    /** Returns {@code this} where {@code l = array/buffer[index(indices)]} */
    public LongIndexer get(long[] indices, long[] l) { return get(indices, l, 0, l.length); }
    /** Returns {@code this} where {@code l[offset:offset + length] = array/buffer[index(indices)]} */
    public abstract LongIndexer get(long[] indices, long[] l, int offset, int length);

    /** Returns {@code this} where {@code array/buffer[i] = l} */
    public abstract LongIndexer put(long i, long l);
    /** Returns {@code this} where {@code array/buffer[i] = l} */
    public LongIndexer put(long i, long... l) { return put(i, l, 0, l.length); }
    /** Returns {@code this} where {@code array/buffer[i] = l[offset:offset + length]} */
    public abstract LongIndexer put(long i, long[] l, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = l} */
    public abstract LongIndexer put(long i, long j, long l);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = l} */
    public LongIndexer put(long i, long j, long... l) { return put(i, j, l, 0, l.length); }
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = l[offset:offset + length]} */
    public abstract LongIndexer put(long i, long j, long[] l, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j * strides[1] + k] = l} */
    public abstract LongIndexer put(long i, long j, long k, long l);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = l} */
    public abstract LongIndexer put(long[] indices, long l);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = l} */
    public LongIndexer put(long[] indices, long... l) { return put(indices, l, 0, l.length); }
    /** Returns {@code this} where {@code array/buffer[index(indices)] = l[offset:offset + length]} */
    public abstract LongIndexer put(long[] indices, long[] l, int offset, int length);

    @Override public double getDouble(long... indices) { return get(indices); }
    @Override public LongIndexer putDouble(long[] indices, double l) { return put(indices, (long)l); }
}
