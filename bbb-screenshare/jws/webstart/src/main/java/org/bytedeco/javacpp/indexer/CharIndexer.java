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

import java.nio.CharBuffer;
import org.bytedeco.javacpp.CharPointer;

/**
 * Abstract indexer for the {@code char} primitive type.
 *
 * @author Samuel Audet
 */
public abstract class CharIndexer extends Indexer {
    /** The number of bytes used to represent a char. */
    public static final int VALUE_BYTES = 2;

    protected CharIndexer(long[] sizes, long[] strides) {
        super(sizes, strides);
    }

    /** Returns {@code new CharArrayIndexer(array)} */
    public static CharIndexer create(char[] array) {
        return new CharArrayIndexer(array);
    }
    /** Returns {@code new CharBufferIndexer(buffer)} */
    public static CharIndexer create(CharBuffer buffer) {
        return new CharBufferIndexer(buffer);
    }
    /** Returns {@code create(pointer, { pointer.limit() - pointer.position() }, { 1 }, true)} */
    public static CharIndexer create(CharPointer pointer) {
        return create(pointer, new long[] { pointer.limit() - pointer.position() }, new long[] { 1 });
    }

    /** Returns {@code new CharArrayIndexer(array, sizes, strides)} */
    public static CharIndexer create(char[] array, long[] sizes, long[] strides) {
        return new CharArrayIndexer(array, sizes, strides);
    }
    /** Returns {@code new CharBufferIndexer(buffer, sizes, strides)} */
    public static CharIndexer create(CharBuffer buffer, long[] sizes, long[] strides) {
        return new CharBufferIndexer(buffer, sizes, strides);
    }
    /** Returns {@code create(pointer, sizes, strides, true)} */
    public static CharIndexer create(CharPointer pointer, long[] sizes, long[] strides) {
        return create(pointer, sizes, strides, true);
    }
    /**
     * Creates a char indexer to access efficiently the data of a pointer.
     *
     * @param pointer data to access via a buffer or to copy to an array
     * @param direct {@code true} to use a direct buffer, see {@link Indexer} for details
     * @return the new char indexer backed by the raw memory interface, a buffer, or an array
     */
    public static CharIndexer create(final CharPointer pointer, long[] sizes, long[] strides, boolean direct) {
        if (direct) {
            return Raw.getInstance() != null ? new CharRawIndexer(pointer, sizes, strides)
                                             : new CharBufferIndexer(pointer.asBuffer(), sizes, strides);
        } else {
            final long position = pointer.position();
            char[] array = new char[(int)Math.min(pointer.limit() - position, Integer.MAX_VALUE)];
            pointer.get(array);
            return new CharArrayIndexer(array, sizes, strides) {
                @Override public void release() {
                    pointer.position(position).put(array);
                    super.release();
                }
            };
        }
    }

    /** Returns {@code array/buffer[i]} */
    public abstract char get(long i);
    /** Returns {@code this} where {@code c = array/buffer[i]} */
    public CharIndexer get(long i, char[] c) { return get(i, c, 0, c.length); }
    /** Returns {@code this} where {@code c[offset:offset + length] = array/buffer[i]} */
    public abstract CharIndexer get(long i, char[] c, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j]} */
    public abstract char get(long i, long j);
    /** Returns {@code this} where {@code c = array/buffer[i * strides[0] + j]} */
    public CharIndexer get(long i, long j, char[] c) { return get(i, j, c, 0, c.length); }
    /** Returns {@code this} where {@code c[offset:offset + length] = array/buffer[i * strides[0] + j]} */
    public abstract CharIndexer get(long i, long j, char[] c, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j * strides[1] + k]} */
    public abstract char get(long i, long j, long k);
    /** Returns {@code array/buffer[index(indices)]} */
    public abstract char get(long... indices);
    /** Returns {@code this} where {@code c = array/buffer[index(indices)]} */
    public CharIndexer get(long[] indices, char[] c) { return get(indices, c, 0, c.length); }
    /** Returns {@code this} where {@code c[offset:offset + length] = array/buffer[index(indices)]} */
    public abstract CharIndexer get(long[] indices, char[] c, int offset, int length);

    /** Returns {@code this} where {@code array/buffer[i] = c} */
    public abstract CharIndexer put(long i, char c);
    /** Returns {@code this} where {@code array/buffer[i] = c} */
    public CharIndexer put(long i, char... c) { return put(i, c, 0, c.length); }
    /** Returns {@code this} where {@code array/buffer[i] = c[offset:offset + length]} */
    public abstract CharIndexer put(long i, char[] c, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = c} */
    public abstract CharIndexer put(long i, long j, char c);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = c} */
    public CharIndexer put(long i, long j, char... c) { return put(i, j, c, 0, c.length); }
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = c[offset:offset + length]} */
    public abstract CharIndexer put(long i, long j, char[] c, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j * strides[1] + k] = c} */
    public abstract CharIndexer put(long i, long j, long k, char c);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = c} */
    public abstract CharIndexer put(long[] indices, char c);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = c} */
    public CharIndexer put(long[] indices, char... c) { return put(indices, c, 0, c.length); }
    /** Returns {@code this} where {@code array/buffer[index(indices)] = c[offset:offset + length]} */
    public abstract CharIndexer put(long[] indices, char[] c, int offset, int length);

    @Override public double getDouble(long... indices) { return get(indices); }
    @Override public CharIndexer putDouble(long[] indices, double c) { return put(indices, (char)c); }
}
