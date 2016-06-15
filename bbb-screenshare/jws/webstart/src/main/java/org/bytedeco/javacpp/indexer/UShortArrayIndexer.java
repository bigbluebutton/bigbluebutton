/*
 * Copyright (C) 2015-2016 Samuel Audet
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
 * An indexer for a {@code short[]} array, treated as unsigned.
 *
 * @author Samuel Audet
 */
public class UShortArrayIndexer extends UShortIndexer {
    /** The backing array. */
    protected short[] array;

    /** Calls {@code UShortArrayIndexer(array, { array.length }, { 1 })}. */
    public UShortArrayIndexer(short[] array) {
        this(array, new long[] { array.length }, new long[] { 1 });
    }

    /** Constructor to set the {@link #array}, {@link #sizes} and {@link #strides}. */
    public UShortArrayIndexer(short[] array, long[] sizes, long[] strides) {
        super(sizes, strides);
        this.array = array;
    }

    @Override public short[] array() {
        return array;
    }

    @Override public int get(long i) {
        return array[(int)i] & 0xFFFF;
    }
    @Override public UShortIndexer get(long i, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            s[offset + n] = array[(int)i * (int)strides[0] + n] & 0xFFFF;
        }
        return this;
    }
    @Override public int get(long i, long j) {
        return array[(int)i * (int)strides[0] + (int)j] & 0xFFFF;
    }
    @Override public UShortIndexer get(long i, long j, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            s[offset + n] = array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + n] & 0xFFFF;
        }
        return this;
    }
    @Override public int get(long i, long j, long k) {
        return array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k] & 0xFFFF;
    }
    @Override public int get(long... indices) {
        return array[(int)index(indices)] & 0xFFFF;
    }
    @Override public UShortIndexer get(long[] indices, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            s[offset + n] = array[(int)index(indices) + n] & 0xFFFF;
        }
        return this;
    }

    @Override public UShortIndexer put(long i, int s) {
        array[(int)i] = (short)s;
        return this;
    }
    @Override public UShortIndexer put(long i, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)i * (int)strides[0] + n] = (short)s[offset + n];
        }
        return this;
    }
    @Override public UShortIndexer put(long i, long j, int s) {
        array[(int)i * (int)strides[0] + (int)j] = (short)s;
        return this;
    }
    @Override public UShortIndexer put(long i, long j, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + n] = (short)s[offset + n];
        }
        return this;
    }
    @Override public UShortIndexer put(long i, long j, long k, int s) {
        array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k] = (short)s;
        return this;
    }
    @Override public UShortIndexer put(long[] indices, int s) {
        array[(int)index(indices)] = (short)s;
        return this;
    }
    @Override public UShortIndexer put(long[] indices, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)index(indices) + n] = (short)s[offset + n];
        }
        return this;
    }

    @Override public void release() { array = null; }
}
