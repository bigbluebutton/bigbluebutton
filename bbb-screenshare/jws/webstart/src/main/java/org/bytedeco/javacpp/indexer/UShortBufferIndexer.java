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
import java.nio.ShortBuffer;

/**
 * An indexer for a {@link ShortBuffer}, treated as unsigned.
 *
 * @author Samuel Audet
 */
public class UShortBufferIndexer extends UShortIndexer {
    /** The backing buffer. */
    protected ShortBuffer buffer;

    /** Calls {@code UShortBufferIndexer(buffer, { buffer.limit() }, { 1 })}. */
    public UShortBufferIndexer(ShortBuffer buffer) {
        this(buffer, new long[] { buffer.limit() }, new long[] { 1 });
    }

    /** Constructor to set the {@link #buffer}, {@link #sizes} and {@link #strides}. */
    public UShortBufferIndexer(ShortBuffer buffer, long[] sizes, long[] strides) {
        super(sizes, strides);
        this.buffer = buffer;
    }

    @Override public Buffer buffer() {
        return buffer;
    }

    @Override public int get(long i) {
        return buffer.get((int)i) & 0xFFFF;
    }
    @Override public UShortIndexer get(long i, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            s[offset + n] = buffer.get((int)i * (int)strides[0] + n) & 0xFFFF;
        }
        return this;
    }
    @Override public int get(long i, long j) {
        return buffer.get((int)i * (int)strides[0] + (int)j) & 0xFFFF;
    }
    @Override public UShortIndexer get(long i, long j, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            s[offset + n] = buffer.get((int)i * (int)strides[0] + (int)j * (int)strides[1] + n) & 0xFFFF;
        }
        return this;
    }
    @Override public int get(long i, long j, long k) {
        return buffer.get((int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k) & 0xFFFF;
    }
    @Override public int get(long... indices) {
        return buffer.get((int)index(indices)) & 0xFFFF;
    }
    @Override public UShortIndexer get(long[] indices, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            s[offset + n] = buffer.get((int)index(indices) + n) & 0xFFFF;
        }
        return this;
    }

    @Override public UShortIndexer put(long i, int s) {
        buffer.put((int)i, (short)s);
        return this;
    }
    @Override public UShortIndexer put(long i, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)i * (int)strides[0] + n, (short)s[offset + n]);
        }
        return this;
    }
    @Override public UShortIndexer put(long i, long j, int s) {
        buffer.put((int)i * (int)strides[0] + (int)j, (short)s);
        return this;
    }
    @Override public UShortIndexer put(long i, long j, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)i * (int)strides[0] + (int)j * (int)strides[1] + n, (short)s[offset + n]);
        }
        return this;
    }
    @Override public UShortIndexer put(long i, long j, long k, int s) {
        buffer.put((int)i * (int)strides[0] + (int)j * (int)strides[1] + (int)k, (short)s);
        return this;
    }
    @Override public UShortIndexer put(long[] indices, int s) {
        buffer.put((int)index(indices), (short)s);
        return this;
    }
    @Override public UShortIndexer put(long[] indices, int[] s, int offset, int length) {
        for (int n = 0; n < length; n++) {
            buffer.put((int)index(indices) + n, (short)s[offset + n]);
        }
        return this;
    }

    @Override public void release() { buffer = null; }
}
