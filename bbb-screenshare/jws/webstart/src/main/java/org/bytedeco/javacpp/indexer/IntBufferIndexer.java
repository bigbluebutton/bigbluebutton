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

import java.nio.Buffer;
import java.nio.IntBuffer;

/**
 * An indexer for an {@link IntBuffer}.
 *
 * @author Samuel Audet
 */
public class IntBufferIndexer extends IntIndexer {
    /** The backing buffer. */
    protected IntBuffer buffer;

    /** Calls {@code IntBufferIndexer(buffer, { buffer.limit() }, { 1 })}. */
    public IntBufferIndexer(IntBuffer buffer) {
        this(buffer, new long[] { buffer.limit() }, new long[] { 1 });
    }

    /** Constructor to set the {@link #buffer}, {@link #sizes} and {@link #strides}. */
    public IntBufferIndexer(IntBuffer buffer, long[] sizes, long[] strides) {
        super(sizes, strides);
        this.buffer = buffer;
    }

    @Override public Buffer buffer() {
        return buffer;
    }

    @Override public int get(long i) {
        return buffer.get((int)i);
    }
    @Override public IntIndexer get(long i, int[] m, int offset, int length) {
        for (int n = 0; n < length; n++) {
            m[offset + n] = buffer.get((int)i * (int)strides[0] + n);
        }
        return this;
    }
    @Override public int get(long i, long j) {
        return buffer.get((int)i * (int)strides[0] + (int)j);
    }
    @Override public IntIndexer get(long i, long j, int[] m, int offset, int length) {
        for (int n = 0; n < length; n++) {
            m[offset + n] = buffer.get((int)i * (int)strides[0] + (int)j * (int)strides[1] + n);
        }
        return this;
    }
    @Override public int get(long i, long j, long k) {
        return buffer.get((int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k);
    }
    @Override public int get(long... indices) {
        return buffer.get((int)index(indices));
    }
    @Override public IntIndexer get(long[] indices, int[] m, int offset, int length) {
        for (int n = 0; n < length; n++) {
            m[offset + n] = buffer.get((int)index(indices) + n);
        }
        return this;
    }

    @Override public IntIndexer put(long i, int n) {
        buffer.put((int)i, n);
        return this;
    }
    @Override public IntIndexer put(long i, int[] m, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)i * (int)strides[0] + n, m[offset + n]);
        }
        return this;
    }
    @Override public IntIndexer put(long i, long j, int n) {
        buffer.put((int)i * (int)strides[0] + (int)j, n);
        return this;
    }
    @Override public IntIndexer put(long i, long j, int[] m, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)i * (int)strides[0] + (int)j * (int)strides[1] + n, m[offset + n]);
        }
        return this;
    }
    @Override public IntIndexer put(long i, long j, long k, int n) {
        buffer.put((int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k, n);
        return this;
    }
    @Override public IntIndexer put(long[] indices, int n) {
        buffer.put((int)index(indices), n);
        return this;
    }
    @Override public IntIndexer put(long[] indices, int[] m, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)index(indices) + n, m[offset + n]);
        }
        return this;
    }

    @Override public void release() { buffer = null; }
}
