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

/**
 * The peer class to native pointers and arrays of {@code void*}.
 * All operations take into account the position and limit, when appropriate.
 * <p>
 * To support higher levels of indirection, we can create out of the Pointer
 * objects returned by {@link #get(long)} additional PointerPointer objects.
 *
 * @author Samuel Audet
 */
public class PointerPointer<P extends Pointer> extends Pointer {
    /**
     * Allocates enough memory for the array of strings and copies it.
     *
     * @param array the array of strings to copy
     * @see #putString(String[])
     */
    public PointerPointer(String ... array) { this(array.length); putString(array); }
    /**
     * Allocates enough memory for the array of strings and copies it.
     *
     * @param array the array of strings to copy
     * @param charsetName the charset in which the bytes are encoded
     * @see #putString(String[], String)
     * @throws UnsupportedEncodingException
     */
    public PointerPointer(String[] array, String charsetName) throws UnsupportedEncodingException {
        this(array.length); putString(array, charsetName);
    }
    /**
     * Allocates enough memory for the array and copies it.
     *
     * @param array the array to copy
     * @see #put(Pointer[])
     */
    public PointerPointer(P ... array) { this(array.length); put(array); }
    /**
     * Allocates enough memory for the array of arrays and copies it.
     *
     * @param array the array of arrays to copy
     * @see #put(byte[][])
     */
    public PointerPointer(byte[]   ... array) { this(array.length); put(array); }
    /**
     * Allocates enough memory for the array of arrays and copies it.
     *
     * @param array the array of arrays to copy
     * @see #put(short[][])
     */
    public PointerPointer(short[]  ... array) { this(array.length); put(array); }
    /**
     * Allocates enough memory for the array of arrays and copies it.
     *
     * @param array the array of arrays to copy
     * @see #put(int[][])
     */
    public PointerPointer(int[]    ... array) { this(array.length); put(array); }
    /**
     * Allocates enough memory for the array of arrays and copies it.
     *
     * @param array the array of arrays to copy
     * @see #put(long[][])
     */
    public PointerPointer(long[]   ... array) { this(array.length); put(array); }
    /**
     * Allocates enough memory for the array of arrays and copies it.
     *
     * @param array the array of arrays to copy
     * @see #put(float[][])
     */
    public PointerPointer(float[]  ... array) { this(array.length); put(array); }
    /**
     * Allocates enough memory for the array of arrays and copies it.
     *
     * @param array the array of arrays to copy
     * @see #put(double[][])
     */
    public PointerPointer(double[] ... array) { this(array.length); put(array); }
    /**
     * Allocates enough memory for the array of arrays and copies it.
     *
     * @param array the array of arrays to copy
     * @see #put(char[][])
     */
    public PointerPointer(char[]   ... array) { this(array.length); put(array); }
    /**
     * Allocates a native array of {@code void*} of the given size.
     *
     * @param size the number of {@code void*} elements to allocate
     */
    public PointerPointer(long size) {
        try {
            allocateArray(size);
        } catch (UnsatisfiedLinkError e) {
            throw new RuntimeException("No native JavaCPP library in memory. (Has Loader.load() been called?)", e);
        }
    }
    /** @see Pointer#Pointer() */
    public PointerPointer() { }
    /** @see Pointer#Pointer(Pointer) */
    public PointerPointer(Pointer p) { super(p); }
    private native void allocateArray(long size);

    /** This is just to keep references to Pointer objects and prevent premature deallocation. */
    private P[] pointerArray;

    /** @see Pointer#position(long) */
    @Override public PointerPointer<P> position(long position) {
        return super.position(position);
    }
    /** @see Pointer#limit(long) */
    @Override public PointerPointer<P> limit(long limit) {
        return super.limit(limit);
    }
    /** @see Pointer#capacity(long) */
    @Override public PointerPointer<P> capacity(long capacity) {
        return super.capacity(capacity);
    }

    /** @return {@code get(BytePointer.class, i).getString()}
     *  @see BytePointer#getString() */
    public String getString(long i) {
        BytePointer p = (BytePointer)get((Class<P>)BytePointer.class, i);
        return p != null ? p.getString() : null;
    }
    /** @return {@code get(BytePointer.class, i).getString(charsetName)}
     *  @see BytePointer#getString(String) */
    public String getString(long i, String charsetName) throws UnsupportedEncodingException {
        BytePointer p = (BytePointer)get((Class<P>)BytePointer.class, i);
        return p != null ? p.getString(charsetName) : null;
    }

    /**
     * Creates one by one a new {@link BytePointer} for each {@link String},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@link String} to read from
     * @return this
     */
    public PointerPointer<P> putString(String ... array) {
        pointerArray = (P[])new BytePointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new BytePointer(array[i]) : null;
        }
        return put(pointerArray);
    }
    /**
     * Creates one by one a new {@link BytePointer} for each {@link String},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@link String} to read from
     * @param charsetName the charset in which the bytes are encoded
     * @return this
     * @throws UnsupportedEncodingException
     */
    public PointerPointer<P> putString(String[] array, String charsetName) throws UnsupportedEncodingException {
        pointerArray = (P[])new BytePointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new BytePointer(array[i], charsetName) : null;
        }
        return put(pointerArray);
    }

    /**
     * Writes the Pointer values into the native {@code void*} array.
     *
     * @param array the array of Pointer values to read from
     * @return this
     */
    public PointerPointer<P> put(P ... array) {
        pointerArray = array;
        for (int i = 0; i < array.length; i++) {
            put(i, array[i]);
        }
        return this;
    }
    /**
     * Creates one by one a new {@link BytePointer} for each {@code byte[]},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@code byte[]} to read from
     * @return this
     */
    public PointerPointer<P> put(byte[] ... array) {
        pointerArray = (P[])new BytePointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new BytePointer(array[i]) : null;
        }
        return put(pointerArray);
    }
    /**
     * Creates one by one a new {@link ShortPointer} for each {@code short[]},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@code short[]} to read from
     * @return this
     */
    public PointerPointer<P> put(short[] ... array) {
        pointerArray = (P[])new ShortPointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new ShortPointer(array[i]) : null;
        }
        return put(pointerArray);
    }
    /**
     * Creates one by one a new {@link IntPointer} for each {@code int[]},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@code int[]} to read from
     * @return this
     */
    public PointerPointer<P> put(int[] ... array) {
        pointerArray = (P[])new IntPointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new IntPointer(array[i]) : null;
        }
        return put(pointerArray);
    }
    /**
     * Creates one by one a new {@link LongPointer} for each {@code long[]},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@code long[]} to read from
     * @return this
     */
    public PointerPointer<P> put(long[] ... array) {
        pointerArray = (P[])new LongPointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new LongPointer(array[i]) : null;
        }
        return put(pointerArray);
    }
    /**
     * Creates one by one a new {@link FloatPointer} for each {@code float[]},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@code float[]} to read from
     * @return this
     */
    public PointerPointer<P> put(float[] ... array) {
        pointerArray = (P[])new FloatPointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new FloatPointer(array[i]) : null;
        }
        return put(pointerArray);
    }
    /**
     * Creates one by one a new {@link DoublePointer} for each {@code double[]},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@code double[]} to read from
     * @return this
     */
    public PointerPointer<P> put(double[] ... array) {
        pointerArray = (P[])new DoublePointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new DoublePointer(array[i]) : null;
        }
        return put(pointerArray);
    }
    /**
     * Creates one by one a new {@link CharPointer} for each {@code char[]},
     * and writes them into the native {@code void*} array.
     *
     * @param array the array of {@code char[]} to read from
     * @return this
     */
    public PointerPointer<P> put(char[] ... array) {
        pointerArray = (P[])new CharPointer[array.length];
        for (int i = 0; i < array.length; i++) {
            pointerArray[i] = array[i] != null ? (P)new CharPointer(array[i]) : null;
        }
        return put(pointerArray);
    }

    /** @return {@code get(0)} */
    public Pointer get() { return get(0); }
    /** @return {@code get(cls, 0)} */
    public P get(Class<P> cls) { return get(cls, 0); }
    /** @return the i-th Pointer value of a native array */
    public Pointer get(long i) { return get((Class<P>)Pointer.class, i); }
    /** @return in the given class the i-th Pointer value of a native array */
    public native P get(Class<P> cls, long i);
    /** @return {@code put(0, p)} */
    public PointerPointer<P> put(Pointer p) { return put(0, p); }
    /**
     * Copies the Pointer value to the i-th element of a native array.
     *
     * @param i the index into the array
     * @param p the Pointer value to copy
     * @return this
     */
    public native PointerPointer<P> put(long i, Pointer p);
}
