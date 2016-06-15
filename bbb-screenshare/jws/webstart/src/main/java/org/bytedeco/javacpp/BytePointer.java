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

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import org.bytedeco.javacpp.annotation.Cast;

/**
 * The peer class to native pointers and arrays of {@code signed char}, including strings.
 * All operations take into account the position and limit, when appropriate.
 *
 * @author Samuel Audet
 */
public class BytePointer extends Pointer {
    /**
     * Allocates enough memory for the encoded string and actually encodes it
     * in the named charset before copying it.
     *
     * @param s the String to encode and copy
     * @param charsetName the charset in which the bytes are encoded
     * @throws UnsupportedEncodingException
     * @see #putString(String, String)
     */
    public BytePointer(String s, String charsetName)
            throws UnsupportedEncodingException {
        this(s.getBytes(charsetName).length + 1);
        putString(s, charsetName);
    }
    /**
     * Allocates enough memory for the encoded string and actually encodes it
     * in the platform's default charset before copying it.
     *
     * @param s the String to encode and copy
     * @see #putString(String)
     */
    public BytePointer(String s) {
        this(s.getBytes().length+1);
        putString(s);
    }
    /**
     * Allocates enough memory for the array and copies it.
     *
     * @param array the array to copy
     * @see #put(byte[])
     */
    public BytePointer(byte ... array) {
        this(array.length);
        put(array);
    }
    /**
     * For direct buffers, calls {@link Pointer#Pointer(Buffer)}, while for buffers
     * backed with an array, allocates enough memory for the array and copies it.
     *
     * @param buffer the Buffer to reference or copy
     * @see #put(byte[])
     */
    public BytePointer(ByteBuffer buffer) {
        super(buffer);
        if (buffer != null && buffer.hasArray()) {
            byte[] array = buffer.array();
            allocateArray(array.length - buffer.arrayOffset());
            put(array, buffer.arrayOffset(), array.length - buffer.arrayOffset());
            position(buffer.position());
            limit(buffer.limit());
        }
    }
    /**
     * Allocates a native {@code signed char} array of the given size.
     *
     * @param size the number of {@code signed char} elements to allocate
     */
    public BytePointer(long size) {
        try {
            allocateArray(size);
        } catch (UnsatisfiedLinkError e) {
            throw new RuntimeException("No native JavaCPP library in memory. (Has Loader.load() been called?)", e);
        }
    }
    /** @see Pointer#Pointer() */
    public BytePointer() { }
    /** @see Pointer#Pointer(Pointer) */
    public BytePointer(Pointer p) { super(p); }
    private native void allocateArray(long size);

    /** @see Pointer#position(long) */
    @Override public BytePointer position(long position) {
        return super.position(position);
    }
    /** @see Pointer#limit(long) */
    @Override public BytePointer limit(long limit) {
        return super.limit(limit);
    }
    /** @see Pointer#capacity(long) */
    @Override public BytePointer capacity(long capacity) {
        return super.capacity(capacity);
    }

    /** Returns the bytes, assuming a null-terminated string if {@code limit <= position}. */
    public byte[] getStringBytes() {
        long size = limit - position;
        if (size <= 0) {
            size = strlen(this);
        }
        byte[] array = new byte[(int)Math.min(size, Integer.MAX_VALUE)];
        get(array);
        return array;
    }
    /**
     * Decodes the native bytes assuming they are encoded in the named charset.
     * Assumes a null-terminated string if {@code limit <= position}.
     *
     * @param charsetName the charset in which the bytes are encoded
     * @return a String from the null-terminated string
     * @throws UnsupportedEncodingException
     */
    public String getString(String charsetName)
            throws UnsupportedEncodingException {
        return new String(getStringBytes(), charsetName);
    }
    /**
     * Decodes the native bytes assuming they are encoded in the platform's default charset.
     * Assumes a null-terminated string if {@code limit <= position}.
     *
     * @return a String from the null-terminated string
     */
    public String getString() {
        return new String(getStringBytes());
    }

    /**
     * Encodes the String into the named charset and copies it in native memory,
     * including a terminating null byte.
     * Sets the limit to just before the terminating null byte.
     *
     * @param s the String to encode and copy
     * @param charsetName the charset in which to encode the bytes
     * @return this
     * @throws UnsupportedEncodingException
     * @see String#getBytes(String)
     * @see #put(byte[])
     */
    public BytePointer putString(String s, String charsetName)
            throws UnsupportedEncodingException {
        byte[] bytes = s.getBytes(charsetName);
        return put(bytes).put(bytes.length, (byte)0).limit(bytes.length);
    }
    /**
     * Encodes the String into the platform's default charset and copies it in
     * native memory, including a terminating null byte.
     * Sets the limit to just before the terminating null byte.
     *
     * @param s the String to encode and copy
     * @return this
     * @see String#getBytes()
     * @see #put(byte[])
     */
    public BytePointer putString(String s) {
        byte[] bytes = s.getBytes();
        return put(bytes).put(bytes.length, (byte)0).limit(bytes.length);
    }

    /** @return {@code get(0)} */
    public byte get() { return get(0); }
    /** @return the i-th {@code byte} value of a native array */
    public native byte get(long i);
    /** @return {@code put(0, b)} */
    public BytePointer put(byte b) { return put(0, b); }
    /**
     * Copies the {@code byte} value to the i-th element of a native array.
     *
     * @param i the index into the array
     * @param b the {@code byte} value to copy
     * @return this
     */
    public native BytePointer put(long i, byte b);

    /** @return {@code get(array, 0, array.length)} */
    public BytePointer get(byte[] array) { return get(array, 0, array.length); }
    /** @return {@code put(array, 0, array.length)} */
    public BytePointer put(byte ... array) { return put(array, 0, array.length); }
    /**
     * Reads a portion of the native array into a Java array.
     *
     * @param array the array to write to
     * @param offset the offset into the array where to start writing
     * @param length the length of data to read and write
     * @return this
     */
    public native BytePointer get(byte[] array, int offset, int length);
    /**
     * Writes a portion of a Java array into the native array.
     *
     * @param array the array to read from
     * @param offset the offset into the array where to start reading
     * @param length the length of data to read and write
     * @return this
     */
    public native BytePointer put(byte[] array, int offset, int length);

    /** @return {@code asByteBuffer()} */
    @Override public final ByteBuffer asBuffer() {
        return asByteBuffer();
    }

    public static native @Cast("char*") BytePointer strcat(@Cast("char*") BytePointer dst, @Cast("char*") BytePointer src);
    public static native @Cast("char*") BytePointer strchr(@Cast("char*") BytePointer str, int ch);
    public static native int strcmp(@Cast("char*") BytePointer str1, @Cast("char*") BytePointer str2);
    public static native int strcoll(@Cast("char*") BytePointer str1, @Cast("char*") BytePointer str2);
    public static native @Cast("char*") BytePointer strcpy(@Cast("char*") BytePointer dst, @Cast("char*") BytePointer src);
    public static native @Cast("size_t") long strcspn(@Cast("char*") BytePointer str1, @Cast("char*") BytePointer str2);
    public static native @Cast("char*") BytePointer strerror(int errnum);
    public static native @Cast("size_t") long strlen(@Cast("char*") BytePointer str);
    public static native @Cast("char*") BytePointer strncat(@Cast("char*") BytePointer dst, @Cast("char*") BytePointer src, @Cast("size_t") long n);
    public static native int strncmp(@Cast("char*") BytePointer str1, @Cast("char*") BytePointer str2, @Cast("size_t") long n);
    public static native @Cast("char*") BytePointer strncpy(@Cast("char*") BytePointer dst, @Cast("char*") BytePointer src, @Cast("size_t") long n);
    public static native @Cast("char*") BytePointer strpbrk(@Cast("char*") BytePointer str1, @Cast("char*") BytePointer str2);
    public static native @Cast("char*") BytePointer strrchr(@Cast("char*") BytePointer str, int ch);
    public static native @Cast("size_t") long strspn(@Cast("char*") BytePointer str1, @Cast("char*") BytePointer str2);
    public static native @Cast("char*") BytePointer strstr(@Cast("char*") BytePointer str1, @Cast("char*") BytePointer str2);
    public static native @Cast("char*") BytePointer strtok(@Cast("char*") BytePointer str, @Cast("char*") BytePointer delim);
    public static native @Cast("size_t") long strxfrm (@Cast("char*") BytePointer dst, @Cast("char*") BytePointer src, @Cast("size_t") long n);
}
