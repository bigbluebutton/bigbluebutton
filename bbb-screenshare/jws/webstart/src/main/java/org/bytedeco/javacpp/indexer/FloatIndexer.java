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

import java.nio.FloatBuffer;
import org.bytedeco.javacpp.FloatPointer;

/**
 * Abstract indexer for the {@code float} primitive type.
 *
 * @author Samuel Audet
 */
public abstract class FloatIndexer extends Indexer {
    /** The number of bytes used to represent a float. */
    public static final int VALUE_BYTES = 4;

    protected FloatIndexer(long[] sizes, long[] strides) {
        super(sizes, strides);
    }

    /** Returns {@code new FloatArrayIndexer(array)} */
    public static FloatIndexer create(float[] array) {
        return new FloatArrayIndexer(array);
    }
    /** Returns {@code new FloatBufferIndexer(buffer)} */
    public static FloatIndexer create(FloatBuffer buffer) {
        return new FloatBufferIndexer(buffer);
    }
    /** Returns {@code create(pointer, { pointer.limit() - pointer.position() }, { 1 }, true)} */
    public static FloatIndexer create(FloatPointer pointer) {
        return create(pointer, new long[] { pointer.limit() - pointer.position() }, new long[] { 1 });
    }

    /** Returns {@code new FloatArrayIndexer(array, sizes, strides)} */
    public static FloatIndexer create(float[] array, long[] sizes, long[] strides) {
        return new FloatArrayIndexer(array, sizes, strides);
    }
    /** Returns {@code new FloatBufferIndexer(buffer, sizes, strides)} */
    public static FloatIndexer create(FloatBuffer buffer, long[] sizes, long[] strides) {
        return new FloatBufferIndexer(buffer, sizes, strides);
    }
    /** Returns {@code create(pointer, sizes, strides, true)} */
    public static FloatIndexer create(FloatPointer pointer, long[] sizes, long[] strides) {
        return create(pointer, sizes, strides, true);
    }
    /**
     * Creates a float indexer to access efficiently the data of a pointer.
     *
     * @param pointer data to access via a buffer or to copy to an array
     * @param direct {@code true} to use a direct buffer, see {@link Indexer} for details
     * @return the new float indexer backed by the raw memory interface, a buffer, or an array
     */
    public static FloatIndexer create(final FloatPointer pointer, long[] sizes, long[] strides, boolean direct) {
        if (direct) {
            return Raw.getInstance() != null ? new FloatRawIndexer(pointer, sizes, strides)
                                             : new FloatBufferIndexer(pointer.asBuffer(), sizes, strides);
        } else {
            final long position = pointer.position();
            float[] array = new float[(int)Math.min(pointer.limit() - position, Integer.MAX_VALUE)];
            pointer.get(array);
            return new FloatArrayIndexer(array, sizes, strides) {
                @Override public void release() {
                    pointer.position(position).put(array);
                    super.release();
                }
            };
        }
    }

    /** Returns {@code array/buffer[i]} */
    public abstract float get(long i);
    /** Returns {@code this} where {@code f = array/buffer[i]} */
    public FloatIndexer get(long i, float[] f) { return get(i, f, 0, f.length); }
    /** Returns {@code this} where {@code f[offset:offset + length] = array/buffer[i]} */
    public abstract FloatIndexer get(long i, float[] f, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j]} */
    public abstract float get(long i, long j);
    /** Returns {@code this} where {@code f = array/buffer[i * strides[0] + j]} */
    public FloatIndexer get(long i, long j, float[] f) { return get(i, j, f, 0, f.length); }
    /** Returns {@code this} where {@code f[offset:offset + length] = array/buffer[i * strides[0] + j]} */
    public abstract FloatIndexer get(long i, long j, float[] f, int offset, int length);
    /** Returns {@code array/buffer[i * strides[0] + j * strides[1] + k]} */
    public abstract float get(long i, long j, long k);
    /** Returns {@code array/buffer[index(indices)]} */
    public abstract float get(long... indices);
    /** Returns {@code this} where {@code f = array/buffer[index(indices)]} */
    public FloatIndexer get(long[] indices, float[] f) { return get(indices, f, 0, f.length); }
    /** Returns {@code this} where {@code f[offset:offset + length] = array/buffer[index(indices)]} */
    public abstract FloatIndexer get(long[] indices, float[] f, int offset, int length);

    /** Returns {@code this} where {@code array/buffer[i] = f} */
    public abstract FloatIndexer put(long i, float f);
    /** Returns {@code this} where {@code array/buffer[i] = f} */
    public FloatIndexer put(long i, float... f) { return put(i, f, 0, f.length); }
    /** Returns {@code this} where {@code array/buffer[i] = f[offset:offset + length]} */
    public abstract FloatIndexer put(long i, float[] f, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = f} */
    public abstract FloatIndexer put(long i, long j, float f);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = f} */
    public FloatIndexer put(long i, long j, float... f) { return put(i, j, f, 0, f.length); }
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j] = f[offset:offset + length]} */
    public abstract FloatIndexer put(long i, long j, float[] f, int offset, int length);
    /** Returns {@code this} where {@code array/buffer[i * strides[0] + j * strides[1] + k] = f} */
    public abstract FloatIndexer put(long i, long j, long k, float f);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = f} */
    public abstract FloatIndexer put(long[] indices, float f);
    /** Returns {@code this} where {@code array/buffer[index(indices)] = f} */
    public FloatIndexer put(long[] indices, float... f) { return put(indices, f, 0, f.length); }
    /** Returns {@code this} where {@code array/buffer[index(indices)] = f[offset:offset + length]} */
    public abstract FloatIndexer put(long[] indices, float[] f, int offset, int length);

    @Override public double getDouble(long... indices) { return get(indices); }
    @Override public FloatIndexer putDouble(long[] indices, double f) { return put(indices, (float)f); }
}
