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

/**
 * An indexer for a {@code float[]} array.
 *
 * @author Samuel Audet
 */
public class FloatArrayIndexer extends FloatIndexer {
    /** The backing array. */
    protected float[] array;

    /** Calls {@code FloatArrayIndexer(array, { array.length }, { 1 })}. */
    public FloatArrayIndexer(float[] array) {
        this(array, new long[] { array.length }, new long[] { 1 });
    }

    /** Constructor to set the {@link #array}, {@link #sizes} and {@link #strides}. */
    public FloatArrayIndexer(float[] array, long[] sizes, long[] strides) {
        super(sizes, strides);
        this.array = array;
    }

    @Override public float[] array() {
        return array;
    }

    @Override public float get(long i) {
        return array[(int)i];
    }
    @Override public FloatIndexer get(long i, float[] f, int offset, int length) {
        for (int n = 0; n < length; n++) {
            f[offset + n] = array[(int)i * (int)strides[0] + n];
        }
        return this;
    }
    @Override public float get(long i, long j) {
        return array[(int)i * (int)strides[0] + (int)j];
    }
    @Override public FloatIndexer get(long i, long j, float[] f, int offset, int length) {
        for (int n = 0; n < length; n++) {
            f[offset + n] = array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + n];
        }
        return this;
    }
    @Override public float get(long i, long j, long k) {
        return array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k];
    }
    @Override public float get(long... indices) {
        return array[(int)index(indices)];
    }
    @Override public FloatIndexer get(long[] indices, float[] f, int offset, int length) {
        for (int n = 0; n < length; n++) {
            f[offset + n] = array[(int)index(indices) + n];
        }
        return this;
    }

    @Override public FloatIndexer put(long i, float f) {
        array[(int)i] = f;
        return this;
    }
    @Override public FloatIndexer put(long i, float[] f, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)i * (int)strides[0] + n] = f[offset + n];
        }
        return this;
    }
    @Override public FloatIndexer put(long i, long j, float f) {
        array[(int)i * (int)strides[0] + (int)j] = f;
        return this;
    }
    @Override public FloatIndexer put(long i, long j, float[] f, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + n] = f[offset + n];
        }
        return this;
    }
    @Override public FloatIndexer put(long i, long j, long k, float f) {
        array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k] = f;
        return this;
    }
    @Override public FloatIndexer put(long[] indices, float f) {
        array[(int)index(indices)] = f;
        return this;
    }
    @Override public FloatIndexer put(long[] indices, float[] f, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)index(indices) + n] = f[offset + n];
        }
        return this;
    }

    @Override public void release() { array = null; }
}
