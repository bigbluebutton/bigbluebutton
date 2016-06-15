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

import java.nio.Buffer;
import java.nio.ByteBuffer;

/**
 * An indexer for a {@link ByteBuffer}, treated as unsigned.
 *
 * @author Samuel Audet
 */
public class UByteBufferIndexer extends UByteIndexer {
    /** The backing buffer. */
    protected ByteBuffer buffer;

    /** Calls {@code UByteBufferIndexer(buffer, { buffer.limit() }, { 1 })}. */
    public UByteBufferIndexer(ByteBuffer buffer) {
        this(buffer, new long[] { buffer.limit() }, new long[] { 1 });
    }

    /** Constructor to set the {@link #buffer}, {@link #sizes} and {@link #strides}. */
    public UByteBufferIndexer(ByteBuffer buffer, long[] sizes, long[] strides) {
        super(sizes, strides);
        this.buffer = buffer;
    }

    @Override public Buffer buffer() {
        return buffer;
    }

    @Override public int get(long i) {
        return buffer.get((int)i) & 0xFF;
    }
    @Override public UByteIndexer get(long i, int[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = buffer.get((int)i * (int)strides[0] + n) & 0xFF;
        }
        return this;
    }
    @Override public int get(long i, long j) {
        return buffer.get((int)i * (int)strides[0] + (int)j) & 0xFF;
    }
    @Override public UByteIndexer get(long i, long j, int[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = buffer.get((int)i * (int)strides[0] + (int)j * (int)strides[1] + n) & 0xFF;
        }
        return this;
    }
    @Override public int get(long i, long j, long k) {
        return buffer.get((int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k) & 0xFF;
    }
    @Override public int get(long... indices) {
        return buffer.get((int)index(indices)) & 0xFF;
    }
    @Override public UByteIndexer get(long[] indices, int[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            b[offset + n] = buffer.get((int)index(indices) + n) & 0xFF;
        }
        return this;
    }

    @Override public UByteIndexer put(long i, int b) {
        buffer.put((int)i, (byte)b);
        return this;
    }
    @Override public UByteIndexer put(long i, int[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)i * (int)strides[0] + n, (byte)b[offset + n]);
        }
        return this;
    }
    @Override public UByteIndexer put(long i, long j, int b) {
        buffer.put((int)i * (int)strides[0] + (int)j, (byte)b);
        return this;
    }
    @Override public UByteIndexer put(long i, long j, int[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)i * (int)strides[0] + (int)j * (int)strides[1] + n, (byte)b[offset + n]);
        }
        return this;
    }
    @Override public UByteIndexer put(long i, long j, long k, int b) {
        buffer.put((int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k, (byte)b);
        return this;
    }
    @Override public UByteIndexer put(long[] indices, int b) {
        buffer.put((int)index(indices), (byte)b);
        return this;
    }
    @Override public UByteIndexer put(long[] indices, int[] b, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)index(indices) + n, (byte)b[offset + n]);
        }
        return this;
    }

    @Override public void release() { buffer = null; }
}
