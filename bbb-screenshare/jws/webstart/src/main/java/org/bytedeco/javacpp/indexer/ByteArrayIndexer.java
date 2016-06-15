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
 * An indexer for a {@code byte[]} array.
 *
 * @author Samuel Audet
 */
public class ByteArrayIndexer extends ByteIndexer {
    /** The backing array. */
    protected byte[] array;

    /** Calls {@code ByteArrayIndexer(array, { array.length }, { 1 })}. */
    public ByteArrayIndexer(byte[] array) {
        this(array, new long[] { array.length }, new long[] { 1 });
    }

    /** Constructor to set the {@link #array}, {@link #sizes} and {@link #strides}. */
    public ByteArrayIndexer(byte[] array, long[] sizes, long[] strides) {
        super(sizes, strides);
        this.array = array;
    }

    @Override public byte[] array() {
        return array;
    }

    @Override public byte get(long i) {
        return array[(int)i];
    }
    @Override public ByteIndexer get(long i, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = array[(int)i * (int)strides[0] + n];
        }
        return this;
    }
    @Override public byte get(long i, long j) {
        return array[(int)i * (int)strides[0] + (int)j];
    }
    @Override public ByteIndexer get(long i, long j, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + n];
        }
        return this;
    }
    @Override public byte get(long i, long j, long k) {
        return array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k];
    }
    @Override public byte get(long... indices) {
        return array[(int)index(indices)];
    }
    @Override public ByteIndexer get(long[] indices, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = array[(int)index(indices) + n];
        }
        return this;
    }

    @Override public ByteIndexer put(long i, byte b) {
        array[(int)i] = b;
        return this;
    }
    @Override public ByteIndexer put(long i, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)i * (int)strides[0] + n] = b[offset + n];
        }
        return this;
    }
    @Override public ByteIndexer put(long i, long j, byte b) {
        array[(int)i * (int)strides[0] + (int)j] = b;
        return this;
    }
    @Override public ByteIndexer put(long i, long j, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + n] = b[offset + n];
        }
        return this;
    }
    @Override public ByteIndexer put(long i, long j, long k, byte b) {
        array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k] = b;
        return this;
    }
    @Override public ByteIndexer put(long[] indices, byte b) {
        array[(int)index(indices)] = b;
        return this;
    }
    @Override public ByteIndexer put(long[] indices, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)index(indices) + n] = b[offset + n];
        }
        return this;
    }

    @Override public void release() { array = null; }
}
