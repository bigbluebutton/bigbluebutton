/*
 * Copyright (C) 2012 Samuel Audet
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

package org.bytedeco.javacv;

/**
 *
 * @author Samuel Audet
 */
public class BufferRing<B extends BufferRing.ReleasableBuffer> {
    public BufferRing(BufferFactory<B> factory, int size) {
        buffers = new Object[size];
        for (int i = 0; i < size; i++) {
            buffers[i] = factory.create();
        }
        position = 0;
    }

    public interface BufferFactory<B extends ReleasableBuffer> {
        B create();
    }

    public interface ReleasableBuffer {
        void release();
    }

    private Object[] buffers;
    private int position;

    public int capacity() {
        return buffers.length;
    }

    public int position() {
        return position;
    }
    public BufferRing position(int position) {
        this.position = ((position % buffers.length) + buffers.length) % buffers.length;
        return this;
    }

    @SuppressWarnings("unchecked")
    public B get() {
        return (B)buffers[position];
    }

    @SuppressWarnings("unchecked")
    public B get(int offset) {
        return (B)buffers[((position + offset) % buffers.length + buffers.length) % buffers.length];
    }

    @SuppressWarnings("unchecked")
    public void release() {
        for (int i = 0; i < buffers.length; i++) {
            ((B)buffers[i]).release();
        }
        buffers = null;
    }
}
