/*
 * Copyright (C) 2011-2013 Samuel Audet
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

import org.bytedeco.javacpp.annotation.ByPtr;
import org.bytedeco.javacpp.annotation.ByRef;
import org.bytedeco.javacpp.annotation.ByVal;
import org.bytedeco.javacpp.tools.Generator;

/**
 * All peer classes to function pointers must derive from FunctionPointer.
 * Defining a subclass lets {@link Generator} create a native function type.
 * A C++ function object gets instantiated for each call to {@code allocate()}
 * as well. That function object can be accessed by annotating any method
 * parameter with {@link ByVal} or {@link ByRef}. By default, an actual
 * function pointer gets passed {@link ByPtr}.
 * <p>
 * To use FunctionPointer, subclass and add a native method named {@code call()}
 * or {@code apply()}, along with its return type and parameters, as well as the
 * usual {@code native void allocate()} method to support explicit allocation,
 * which is typically a requirement for callback functions.
 *
 * @see Generator
 *
 * @author Samuel Audet
 */
public abstract class FunctionPointer extends Pointer {
    protected FunctionPointer() { }
    protected FunctionPointer(Pointer p) { super(p); }
}
