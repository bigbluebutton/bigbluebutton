/*
 * Copyright (C) 2016 Samuel Audet
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

import java.lang.reflect.Field;
import sun.misc.Unsafe;

/**
 * The raw memory interface based on {@link Unsafe}.
 *
 * @author Samuel Audet
 */
class UnsafeRaw extends Raw {

    protected static final Unsafe UNSAFE;
    static {
        Unsafe o;
        try {
            Class c = Class.forName("sun.misc.Unsafe");
            Field f = c.getDeclaredField("theUnsafe");
            c.getDeclaredMethod("getByte", long.class);
            c.getDeclaredMethod("getShort", long.class);
            c.getDeclaredMethod("getInt", long.class);
            c.getDeclaredMethod("getLong", long.class);
            c.getDeclaredMethod("getFloat", long.class);
            c.getDeclaredMethod("getDouble", long.class);
            c.getDeclaredMethod("getChar", long.class);
            f.setAccessible(true);
            o = (Unsafe)f.get(null);
        } catch (ClassNotFoundException | IllegalArgumentException | IllegalAccessException
                | NoSuchFieldException | NoSuchMethodException | SecurityException ex) {
            o = null;
        }
        UNSAFE = o;
    }

    static boolean isAvailable() { return UNSAFE != null; }

    @Override byte getByte(long address) { return UNSAFE.getByte(address); }
    @Override void putByte(long address, byte b) { UNSAFE.putByte(address, b); }
    @Override short getShort(long address) { return UNSAFE.getShort(address); }
    @Override void putShort(long address, short s) { UNSAFE.putShort(address, s); }
    @Override int getInt(long address) { return UNSAFE.getInt(address); }
    @Override void putInt(long address, int i) { UNSAFE.putInt(address, i); }
    @Override long getLong(long address) { return UNSAFE.getLong(address); }
    @Override void putLong(long address, long l) { UNSAFE.putLong(address, l); }
    @Override float getFloat(long address) { return UNSAFE.getFloat(address); }
    @Override void putFloat(long address, float f) { UNSAFE.putFloat(address, f); }
    @Override double getDouble(long address) { return UNSAFE.getDouble(address); }
    @Override void putDouble(long address, double d) { UNSAFE.putDouble(address, d); }
    @Override char getChar(long address) { return UNSAFE.getChar(address); }
    @Override void putChar(long address, char c) { UNSAFE.putChar(address, c); }
}
