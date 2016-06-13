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
 * An indexer for a {@code long[]} array.
 *
 * @author Samuel Audet
 */
public class LongArrayIndexer extends LongIndexer {
    /** The backing array. */
    protected long[] array;

    /** Calls {@code LongArrayIndexer(array, { array.length }, { 1 })}. */
    public LongArrayIndexer(long[] array) {
        this(array, new long[] { array.length }, new long[] { 1 });
    }

    /** Constructor to set the {@link #array}, {@link #sizes} and {@link #strides}. */
    public LongArrayIndexer(long[] array, long[] sizes, long[] strides) {
        super(sizes, strides);
        this.array = array;
    }

    @Override public long[] array() {
        return array;
    }

    @Override public long get(long i) {
        return array[(int)i];
    }
    @Override public LongIndexer get(long i, long[] l, int offset, int length) {
        for (int n = 0; n < length; n++) {
            l[offset + n] = array[(int)i * (int)strides[0] + n];
        }
        return this;
    }
    @Override public long get(long i, long j) {
        return array[(int)i * (int)strides[0] + (int)j];
    }
    @Override public LongIndexer get(long i, long j, long[] l, int offset, int length) {
        for (int n = 0; n < length; n++) {
            l[offset + n] = array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + n];
        }
        return this;
    }
    @Override public long get(long i, long j, long k) {
        return array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k];
    }
    @Override public long get(long... indices) {
        return array[(int)index(indices)];
    }
    @Override public LongIndexer get(long[] indices, long[] l, int offset, int length) {
        for (int n = 0; n < length; n++) {
            l[offset + n] = array[(int)index(indices) + n];
        }
        return this;
    }

    @Override public LongIndexer put(long i, long l) {
        array[(int)i] = l;
        return this;
    }
    @Override public LongIndexer put(long i, long[] l, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)i * (int)strides[0] + n] = l[offset + n];
        }
        return this;
    }
    @Override public LongIndexer put(long i, long j, long l) {
        array[(int)i * (int)strides[0] + (int)j] = l;
        return this;
    }
    @Override public LongIndexer put(long i, long j, long[] l, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + n] = l[offset + n];
        }
        return this;
    }
    @Override public LongIndexer put(long i, long j, long k, long l) {
        array[(int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k] = l;
        return this;
    }
    @Override public LongIndexer put(long[] indices, long l) {
        array[(int)index(indices)] = l;
        return this;
    }
    @Override public LongIndexer put(long[] indices, long[] l, int offset, int length) {
        for (int n = 0; n < length; n++) {
            array[(int)index(indices) + n] = l[offset + n];
        }
        return this;
    }

    @Override public void release() { array = null; }
}
