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
import java.nio.ByteBuffer;

/**
 * An indexer for a {@link ByteBuffer}.
 *
 * @author Samuel Audet
 */
public class ByteBufferIndexer extends ByteIndexer {
    /** The backing buffer. */
    protected ByteBuffer buffer;

    /** Calls {@code ByteBufferIndexer(buffer, { buffer.limit() }, { 1 })}. */
    public ByteBufferIndexer(ByteBuffer buffer) {
        this(buffer, new long[] { buffer.limit() }, new long[] { 1 });
    }

    /** Constructor to set the {@link #buffer}, {@link #sizes} and {@link #strides}. */
    public ByteBufferIndexer(ByteBuffer buffer, long[] sizes, long[] strides) {
        super(sizes, strides);
        this.buffer = buffer;
    }

    @Override public Buffer buffer() {
        return buffer;
    }

    @Override public byte get(long i) {
        return buffer.get((int)i);
    }
    @Override public ByteIndexer get(long i, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = buffer.get((int)i * (int)strides[0] + n);
        }
        return this;
    }
    @Override public byte get(long i, long j) {
        return buffer.get((int)i * (int)strides[0] + (int)j);
    }
    @Override public ByteIndexer get(long i, long j, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = buffer.get((int)i * (int)strides[0] + (int)j * (int)strides[1] + n);
        }
        return this;
    }
    @Override public byte get(long i, long j, long k) {
        return buffer.get((int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k);
    }
    @Override public byte get(long... indices) {
        return buffer.get((int)index(indices));
    }
    @Override public ByteIndexer get(long[] indices, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = buffer.get((int)index(indices) + n);
        }
        return this;
    }

    @Override public ByteIndexer put(long i, byte b) {
        buffer.put((int)i, b);
        return this;
    }
    @Override public ByteIndexer put(long i, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)i * (int)strides[0] + n, b[offset + n]);
        }
        return this;
    }
    @Override public ByteIndexer put(long i, long j, byte b) {
        buffer.put((int)i * (int)strides[0] + (int)j, b);
        return this;
    }
    @Override public ByteIndexer put(long i, long j, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)i * (int)strides[0] + (int)j * (int)strides[1] + n, b[offset + n]);
        }
        return this;
    }
    @Override public ByteIndexer put(long i, long j, long k, byte b) {
        buffer.put((int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k, b);
        return this;
    }
    @Override public ByteIndexer put(long[] indices, byte b) {
        buffer.put((int)index(indices), b);
        return this;
    }
    @Override public ByteIndexer put(long[] indices, byte[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)index(indices) + n, b[offset + n]);
        }
        return this;
    }

    @Override public void release() { buffer = null; }
}
