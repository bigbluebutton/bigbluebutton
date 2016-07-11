/*
 * Copyright (C) 2014 Samuel Audet
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

package org.bytedeco.javacpp.tools;

import java.util.LinkedHashMap;

/**
 *
 * @author Samuel Audet
 */
class TemplateMap extends LinkedHashMap<String,Type> {
    TemplateMap(TemplateMap parent) {
        this.parent = parent;
    }
    Type type = null;
    Declarator declarator = null;
    TemplateMap parent = null;
    boolean variadic = false;

    String getName() {
        return type != null ? type.cppName : declarator != null ? declarator.cppName : null;
    }

    boolean full() {
        for (Type t : values()) {
            if (t == null) {
                return false;
            }
        }
        return true;
    }

    Type get(String key) {
        Type value = super.get(key);
        if (value == null && parent != null) {
            return parent.get(key);
        } else {
            return value;
        }
    }
}
