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

import java.nio.ByteBuffer;
import org.bytedeco.javacpp.BytePointer;

/**
 * Abstract indexer for the {@code byte} primitive type.
 *
 * @author Samuel Audet
 */
public abstract class ByteIndexer extends Indexer {
    /** The number of bytes used to represent a byte. */
    public static final int VALUE_BYTES = 1;

    protected ByteIndexer(long[] sizes, long[] strides) {
        super(sizes, strides);
    }

    /** Returns {@code new ByteArrayIndexer(array)} */
    public static ByteIndexer create(byte[] array) {
        return new ByteArrayIndexer(array);
    }
    /** Returns {@code new ByteBufferIndexer(buffer)} */
    public static ByteIndexer create(ByteBuffer buffer) {
        return new ByteBufferIndexer(buffer);
    }
    /** Returns {@code create(pointer, { pointer.limit() - pointer.position() }, { 1 }, true)} */
    public static ByteIndexer create(BytePointer pointer) {
        return create(pointer, new long[] { pointer.limit() - pointer.position() }, new long[] { 1 });
    }

    /** Returns {@code new ByteArrayIndexer(array, sizes, strides)} */
    public static ByteIndexer create(byte[] array, long[] sizes, long[] strides) {
        return new ByteArrayIndexer(array, sizes, strides);
    }
    /** Returns {@code new ByteBufferIndexer(buffer, sizes, strides)} */
    public static ByteIndexer create(ByteBuffer buffer, long[] sizes, long[] strides) {
        return new ByteBufferIndexer(buffer, sizes, strides);
    }
    /** Returns {@code create(pointer, sizes, strides, true)} */
    public static ByteIndexer create(BytePointer pointer, long[] sizes, long[] strides) {
        return create(pointer, sizes, strides, true);
    }
    /**
     * Creates a byte indexer to access efficiently the data of a pointer.
     *
     * @param pointer data to access via a buffer or to copy to an array
     * @param direct {@code true} to use a direct buffer, see {@link Indexer} for details
     * @return the new byte indexer backed by the raw memory interface, a buffer, or an array
     */
    public static ByteIndexer create(final BytePointer pointer, long[] sizes, long[] strides, boolean direct) {
        if (direct) {
            return Raw.getInstance() != null ? new ByteRawIndexer(pointer, sizes, strides)
                                             : new ByteBufferIndexer(pointer.asBuffer(), sizes, strides);
        } else {
            final long position = pointer.position();
            byte[] array = new byte[(int)Math.min(pointer.limit() - position, Integer.MAX_VALUE)];
            pointer.get(array);
            return new ByteArrayIndexer(array, sizes, strides) {
                @Override public void release() {
                    pointer.position(position).put(array);
                    super.release();
                }
            };
        }
    }

    /** Returns {@code array/buffer[i]} */
    public abstract byte get(long i);
    /** Returns {@code this} where {@code b = array/buffer[i]} */
    public ByteIndexer get(long i, byte[] b) { return get(i, b, 0, b.length); }
    /** Returns {@code this} where {@code b[offset:offset + length] = array/buffer[i]} */
    public abstract ByteIndexer get(long i, byte[] b, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j]} */
    public abstract byte get(long i, long j);
    /** Returns {@code this} where {@code b = array/buffer[i * strides[0] + j]} */
    public ByteIndexer get(long i, long j, byte[] b) { return get(i, j, b, 0, b.length); }
    /** Returns {@code this} where {@code b[offset:offset + length] = array/buffer[i * strides[0] + j]} */
    public abstract ByteIndexer get(long i, long j, byte[] b, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j * strides[1] + k]} */
    public abstract byte get(long i, long j, long k);
    /** Returns {@code array/buffer[index(indices)]} */
    public abstract byte get(long... indices);
    /** Returns {@code this} where {@code b = array/buffer[index(indices)]} */
    public ByteIndexer get(long[] indices, byte[] b) { return get(indices, b, 0, b.length); }
    /** Returns {@code this} where {@code b[offset:offset + length] = array/buffer[index(indices)]} */
    public abstract ByteIndexer get(long[] indices, byte[] b, int offset, int length);

    /** Returns {@code this} where {@code array/buffer[i] = b} */
    public abstract ByteIndexer put(long i, byte b);
    /** Returns {@code this} where {@code array/buffer[i] = b} */
    public ByteIndexer put(long i, byte... b) { return put(i, b, 0, b.length); }
    /** Returns {@code this} where {@code array/buffer[i] = b[offset:offset + length]} */
    public abstract ByteIndexer put(long i, byte[] b, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = b} */
    public abstract ByteIndexer put(long i, long j, byte b);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = b} */
    public ByteIndexer put(long i, long j, byte... b) { return put(i, j, b, 0, b.length); }
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = b[offset:offset + length]} */
    public abstract ByteIndexer put(long i, long j, byte[] b, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j * strides[1] + k] = b} */
    public abstract ByteIndexer put(long i, long j, long k, byte b);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = b} */
    public abstract ByteIndexer put(long[] indices, byte b);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = b} */
    public ByteIndexer put(long[] indices, byte... b) { return put(indices, b, 0, b.length); }
    /** Returns {@code this} where {@code array/buffer[index(indices)] = b[offset:offset + length]} */
    public abstract ByteIndexer put(long[] indices, byte[] b, int offset, int length);

    @Override public double getDouble(long... indices) { return get(indices); }
    @Override public ByteIndexer putDouble(long[] indices, double b) { return put(indices, (byte)b); }
}
