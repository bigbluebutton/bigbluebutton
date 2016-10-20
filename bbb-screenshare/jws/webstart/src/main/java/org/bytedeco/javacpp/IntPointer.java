/*
 * Copyright (C) 2011-2016 Samuel Audet
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

package org.bytedeco.javacpp;

import java.nio.IntBuffer;

/**
 * The peer class to native pointers and arrays of {@code int}, also used for UTF-32.
 * All operations take into account the position and limit, when appropriate.
 *
 * @author Samuel Audet
 */
public class IntPointer extends Pointer {
    /**
     * Allocates enough memory for encoding the String in UTF-32 and copies it.
     *
     * @param s the String to copy
     * @see #putString(String)
     */
    public IntPointer(String s) {
        this(s.length() + 1);
        putString(s);
    }
    /**
     * Allocates enough memory for the array and copies it.
     *
     * @param array the array to copy
     * @see #put(int[])
     */
    public IntPointer(int ... array) {
        this(array.length);
        put(array);
    }
    /**
     * For direct buffers, calls {@link Pointer#Pointer(Buffer)}, while for buffers
     * backed with an array, allocates enough memory for the array and copies it.
     *
     * @param buffer the Buffer to reference or copy
     * @see #put(int[])
     */
    public IntPointer(IntBuffer buffer) {
        super(buffer);
        if (buffer != null && buffer.hasArray()) {
            int[] array = buffer.array();
            allocateArray(array.length - buffer.arrayOffset());
            put(array, buffer.arrayOffset(), array.length - buffer.arrayOffset());
            position(buffer.position());
            limit(buffer.limit());
        }
    }
    /**
     * Allocates a native {@code int} array of the given size.
     *
     * @param size the number of {@code int} elements to allocate
     */
    public IntPointer(long size) {
        try {
            allocateArray(size);
        } catch (UnsatisfiedLinkError e) {
            throw new RuntimeException("No native JavaCPP library in memory. (Has Loader.load() been called?)", e);
        }
    }
    /** @see Pointer#Pointer() */
    public IntPointer() { }
    /** @see Pointer#Pointer(Pointer) */
    public IntPointer(Pointer p) { super(p); }
    private native void allocateArray(long size);

    /** @see Pointer#position(long) */
    @Override public IntPointer position(long position) {
        return super.position(position);
    }
    /** @see Pointer#limit(long) */
    @Override public IntPointer limit(long limit) {
        return super.limit(limit);
    }
    /** @see Pointer#capacity(long) */
    @Override public IntPointer capacity(long capacity) {
        return super.capacity(capacity);
    }

    /** Returns the code points, assuming a null-terminated string if {@code limit <= position}. */
    public int[] getStringCodePoints() {
        if (limit > position) {
            int[] array = new int[(int)Math.min(limit - position, Integer.MAX_VALUE)];
            get(array);
            return array;
        }

        // This may be kind of slow, and should be moved to a JNI function.
        int[] buffer = new int[16];
        int i = 0;
        while ((buffer[i] = get(i)) != 0) {
            i++;
            if (i >= buffer.length) {
                int[] newbuffer = new int[2*buffer.length];
                System.arraycopy(buffer, 0, newbuffer, 0, buffer.length);
                buffer = newbuffer;
            }
        }
        int[] newbuffer = new int[i];
        System.arraycopy(buffer, 0, newbuffer, 0, i);
        return newbuffer;
    }
    /** Returns the String, assuming a null-terminated string if {@code limit <= position}. */
    public String getString() {
        int[] codePoints = getStringCodePoints();
        return new String(codePoints, 0, codePoints.length);
    }
    /**
     * Copies the String code points into native memory, including a terminating null int.
     * Sets the limit to just before the terminating null code point.
     *
     * @param s the String to copy
     * @return this
     * @see String#codePointAt(int)
     * @see #put(int[])
     */
    public IntPointer putString(String s) {
        int[] codePoints = new int[s.length()];
        for (int i = 0; i < codePoints.length; i++) {
            codePoints[i] = s.codePointAt(i);
        }
        return put(codePoints).put(codePoints.length, (int)0).limit(codePoints.length);
    }

    /** @return {@code get(0)} */
    public int get() { return get(0); }
    /** @return the i-th {@code int} value of a native array */
    public native int get(long i);
    /** @return {@code put(0, j)} */
    public IntPointer put(int j) { return put(0, j); }
    /**
     * Copies the {@code int} value to the i-th element of a native array.
     *
     * @param i the index into the array
     * @param j the {@code int} value to copy
     * @return this
     */
    public native IntPointer put(long i, int j);

    /** @return {@code get(array, 0, array.length)} */
    public IntPointer get(int[] array) { return get(array, 0, array.length); }
    /** @return {@code put(array, 0, array.length)} */
    public IntPointer put(int ... array) { return put(array, 0, array.length); }
    /**
     * Reads a portion of the native array into a Java array.
     *
     * @param array the array to write to
     * @param offset the offset into the array where to start writing
     * @param length the length of data to read and write
     * @return this
     */
    public native IntPointer get(int[] array, int offset, int length);
    /**
     * Writes a portion of a Java array into the native array.
     *
     * @param array the array to read from
     * @param offset the offset into the array where to start reading
     * @param length the length of data to read and write
     * @return this
     */
    public native IntPointer put(int[] array, int offset, int length);

    /** @return {@code asByteBuffer().asIntBuffer()} */
    @Override public final IntBuffer asBuffer() {
        return asByteBuffer().asIntBuffer();
    }
}
