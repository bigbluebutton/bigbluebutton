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

import java.nio.CharBuffer;

/**
 * The peer class to native pointers and arrays of {@code short} for UTF-16.
 * All operations take into account the position and limit, when appropriate.
 *
 * @author Samuel Audet
 */
public class CharPointer extends Pointer {
    /**
     * Allocates enough memory for the String and copies it.
     *
     * @param s the String to copy
     * @see #putString(String)
     */
    public CharPointer(String s) {
        this(s.toCharArray().length+1);
        putString(s);
    }
    /**
     * Allocates enough memory for the array and copies it.
     *
     * @param array the array to copy
     * @see #put(char[])
     */
    public CharPointer(char ... array) {
        this(array.length);
        put(array);
    }
    /**
     * For direct buffers, calls {@link Pointer#Pointer(Buffer)}, while for buffers
     * backed with an array, allocates enough memory for the array and copies it.
     *
     * @param buffer the Buffer to reference or copy
     * @see #put(char[])
     */
    public CharPointer(CharBuffer buffer) {
        super(buffer);
        if (buffer != null && buffer.hasArray()) {
            char[] array = buffer.array();
            allocateArray(array.length - buffer.arrayOffset());
            put(array, buffer.arrayOffset(), array.length - buffer.arrayOffset());
            position(buffer.position());
            limit(buffer.limit());
        }
    }
    /**
     * Allocates a native {@code short} array of the given size.
     *
     * @param size the number of {@code short} elements to allocate
     */
    public CharPointer(long size) {
        try {
            allocateArray(size);
        } catch (UnsatisfiedLinkError e) {
            throw new RuntimeException("No native JavaCPP library in memory. (Has Loader.load() been called?)", e);
        }
    }
    /** @see Pointer#Pointer() */
    public CharPointer() { }
    /** @see Pointer#Pointer(Pointer) */
    public CharPointer(Pointer p) { super(p); }
    private native void allocateArray(long size);

    /** @see Pointer#position(long) */
    @Override public CharPointer position(long position) {
        return super.position(position);
    }
    /** @see Pointer#limit(long) */
    @Override public CharPointer limit(long limit) {
        return super.limit(limit);
    }
    /** @see Pointer#capacity(long) */
    @Override public CharPointer capacity(long capacity) {
        return super.capacity(capacity);
    }

    /** Returns the chars, assuming a null-terminated string if {@code limit <= position}. */
    public char[] getStringChars() {
        if (limit > position) {
            char[] array = new char[(int)Math.min(limit - position, Integer.MAX_VALUE)];
            get(array);
            return array;
        }

        // This may be kind of slow, and should be moved to a JNI function.
        char[] buffer = new char[16];
        int i = 0;
        while ((buffer[i] = get(i)) != 0) {
            i++;
            if (i >= buffer.length) {
                char[] newbuffer = new char[2*buffer.length];
                System.arraycopy(buffer, 0, newbuffer, 0, buffer.length);
                buffer = newbuffer;
            }
        }
        char[] newbuffer = new char[i];
        System.arraycopy(buffer, 0, newbuffer, 0, i);
        return newbuffer;
    }
    /** Returns the String, assuming a null-terminated string if {@code limit <= position}. */
    public String getString() {
        return new String(getStringChars());
    }
    /**
     * Copies the String chars into native memory, including a terminating null char.
     * Sets the limit to just before the terminating null character.
     *
     * @param s the String to copy
     * @return this
     * @see String#toCharArray()
     * @see #put(char[])
     */
    public CharPointer putString(String s) {
        char[] chars = s.toCharArray();
        return put(chars).put(chars.length, (char)0).limit(chars.length);
    }

    /** @return {@code get(0)} */
    public char get() { return get(0); }
    /** @return the i-th {@code char} value of a native array */
    public native char get(long i);
    /** @return {@code put(0, c)} */
    public CharPointer put(char c) { return put(0, c); }
    /**
     * Copies the {@code char} value to the i-th element of a native array.
     *
     * @param i the index into the array
     * @param c the {@code char} value to copy
     * @return this
     */
    public native CharPointer put(long i, char c);

    /** @return {@code get(array, 0, array.length)} */
    public CharPointer get(char[] array) { return get(array, 0, array.length); }
    /** @return {@code put(array, 0, array.length)} */
    public CharPointer put(char ... array) { return put(array, 0, array.length); }
    /**
     * Reads a portion of the native array into a Java array.
     *
     * @param array the array to write to
     * @param offset the offset into the array where to start writing
     * @param length the length of data to read and write
     * @return this
     */
    public native CharPointer get(char[] array, int offset, int length);
    /**
     * Writes a portion of a Java array into the native array.
     *
     * @param array the array to read from
     * @param offset the offset into the array where to start reading
     * @param length the length of data to read and write
     * @return this
     */
    public native CharPointer put(char[] array, int offset, int length);

    /** @return {@code asByteBuffer().asCharBuffer()} */
    @Override public final CharBuffer asBuffer() {
        return asByteBuffer().asCharBuffer();
    }
}
