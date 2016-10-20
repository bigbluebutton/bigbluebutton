/*
 * Copyright (C) 2014-2015 Samuel Audet
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A {@link Map} containing {@link Info} objects consumed by the {@link Parser}.
 * Also contains a few utility methods to facilitate its use for both the user
 * and the {@link Parser}.
 *
 * @author Samuel Audet
 */
public class InfoMap extends HashMap<String,List<Info>> {
    public InfoMap() { this.parent = defaults; }
    public InfoMap(InfoMap parent) { this.parent = parent; }

    InfoMap parent = null;
    static final InfoMap defaults = new InfoMap(null)
        .put(new Info("basic/containers").cppTypes("std::bitset", "std::deque", "std::list", "std::map", "std::queue", "std::set",
                                                   "std::stack", "std::vector", "std::valarray", "std::pair"))
        .put(new Info("basic/types").cppTypes("signed", "unsigned", "char", "short", "int", "long", "bool", "float", "double"))

        .put(new Info(" __attribute__", "__declspec").annotations().skip())
        .put(new Info("void").valueTypes("void").pointerTypes("Pointer"))
        .put(new Info("std::nullptr_t").valueTypes("Pointer").pointerTypes("PointerPointer"))
        .put(new Info("FILE", "time_t", "va_list", "std::exception", "std::istream", "std::ostream", "std::iostream",
                "std::ifstream", "std::ofstream", "std::fstream").cast().pointerTypes("Pointer"))

        .put(new Info("int8_t", "__int8", "jbyte", "signed char")
            .valueTypes("byte").pointerTypes("BytePointer", "ByteBuffer", "byte[]"))
        .put(new Info("uint8_t", "unsigned __int8", "char", "unsigned char").cast()
            .valueTypes("byte").pointerTypes("BytePointer", "ByteBuffer", "byte[]"))

        .put(new Info("int16_t", "__int16", "jshort", "short", "signed short", "short int", "signed short int")
            .valueTypes("short").pointerTypes("ShortPointer", "ShortBuffer", "short[]"))
        .put(new Info("uint16_t", "unsigned __int16", "unsigned short", "unsigned short int").cast()
            .valueTypes("short").pointerTypes("ShortPointer", "ShortBuffer", "short[]"))

        .put(new Info("int32_t", "__int32", "jint", "int", "signed int", "signed")
            .valueTypes("int").pointerTypes("IntPointer", "IntBuffer", "int[]"))
        .put(new Info("uint32_t", "unsigned __int32", "unsigned int", "unsigned").cast()
            .valueTypes("int").pointerTypes("IntPointer", "IntBuffer", "int[]"))

        .put(new Info("jlong", "long long", "signed long long", "long long int", "signed long long int")
            .valueTypes("long").pointerTypes("LongPointer", "LongBuffer", "long[]"))
        .put(new Info("int64_t", "__int64", "uint64_t", "unsigned __int64", "unsigned long long", "unsigned long long int").cast()
            .valueTypes("long").pointerTypes("LongPointer", "LongBuffer", "long[]"))

        .put(new Info("long", "signed long", "long int", "signed long int")
            .valueTypes("long").pointerTypes("CLongPointer"))
        .put(new Info("unsigned long", "unsigned long int").cast()
            .valueTypes("long").pointerTypes("CLongPointer"))

        .put(new Info("size_t", "ptrdiff_t", "intptr_t", "uintptr_t", "off_t").cast().valueTypes("long").pointerTypes("SizeTPointer"))
        .put(new Info("float", "jfloat").valueTypes("float").pointerTypes("FloatPointer", "FloatBuffer", "float[]"))
        .put(new Info("double", "jdouble").valueTypes("double").pointerTypes("DoublePointer", "DoubleBuffer", "double[]"))
        .put(new Info("long double").cast().valueTypes("double").pointerTypes("Pointer"))
        .put(new Info("std::complex<float>").cast().pointerTypes("FloatPointer", "FloatBuffer", "float[]"))
        .put(new Info("std::complex<double>").cast().pointerTypes("DoublePointer", "DoubleBuffer", "double[]"))
        .put(new Info("bool", "jboolean").cast().valueTypes("boolean").pointerTypes("BoolPointer", "boolean[]"))
        .put(new Info("wchar_t", "WCHAR").cast().valueTypes("char").pointerTypes("CharPointer"))
        .put(new Info("const char").valueTypes("byte").pointerTypes("@Cast(\"const char*\") BytePointer", "String"))
        .put(new Info("boost::shared_ptr", "std::shared_ptr").annotations("@SharedPtr"))
        .put(new Info("std::string").annotations("@StdString").valueTypes("BytePointer", "String"))
        .put(new Info("std::vector").annotations("@StdVector"))

        .put(new Info("abstract").javaNames("_abstract"))
        .put(new Info("boolean").javaNames("_boolean"))
        .put(new Info("byte").javaNames("_byte"))
        .put(new Info("extends").javaNames("_extends"))
        .put(new Info("finally").javaNames("_finally"))
        .put(new Info("implements").javaNames("_implements"))
        .put(new Info("import").javaNames("_import"))
        .put(new Info("instanceof").javaNames("_instanceof"))
        .put(new Info("native").javaNames("_native"))
        .put(new Info("package").javaNames("_package"))
        .put(new Info("synchronized").javaNames("_synchronized"))
        .put(new Info("transient").javaNames("_transient"))

        .put(new Info("operator ->").javaNames("access"))
        .put(new Info("operator ()").javaNames("apply"))
        .put(new Info("operator []").javaNames("get"))
        .put(new Info("operator =").javaNames("put"))
        .put(new Info("operator +").javaNames("add"))
        .put(new Info("operator -").javaNames("subtract"))
        .put(new Info("operator *").javaNames("multiply"))
        .put(new Info("operator /").javaNames("divide"))
        .put(new Info("operator %").javaNames("mod"))
        .put(new Info("operator ++").javaNames("increment"))
        .put(new Info("operator --").javaNames("decrement"))
        .put(new Info("operator ==").javaNames("equals"))
        .put(new Info("operator !=").javaNames("notEquals"))
        .put(new Info("operator <").javaNames("lessThan"))
        .put(new Info("operator >").javaNames("greaterThan"))
        .put(new Info("operator <=").javaNames("lessThanEquals"))
        .put(new Info("operator >=").javaNames("greaterThanEquals"))
        .put(new Info("operator !").javaNames("not"))
        .put(new Info("operator &&").javaNames("and"))
        .put(new Info("operator ||").javaNames("or"))
        .put(new Info("operator &").javaNames("and"))
        .put(new Info("operator |").javaNames("or"))
        .put(new Info("operator ^").javaNames("xor"))
        .put(new Info("operator ~").javaNames("not"))
        .put(new Info("operator <<").javaNames("shiftLeft"))
        .put(new Info("operator >>").javaNames("shiftRight"))
        .put(new Info("operator +=").javaNames("addPut"))
        .put(new Info("operator -=").javaNames("subtractPut"))
        .put(new Info("operator *=").javaNames("multiplyPut"))
        .put(new Info("operator /=").javaNames("dividePut"))
        .put(new Info("operator %=").javaNames("modPut"))
        .put(new Info("operator &=").javaNames("andPut"))
        .put(new Info("operator |=").javaNames("orPut"))
        .put(new Info("operator ^=").javaNames("xorPut"))
        .put(new Info("operator <<=").javaNames("shiftLeftPut"))
        .put(new Info("operator >>=").javaNames("shiftRightPut"))
        .put(new Info("operator new").javaNames("_new"))
        .put(new Info("operator delete").javaNames("_delete"))

        .put(new Info("allocate").javaNames("_allocate"))
        .put(new Info("close").javaNames("_close"))
        .put(new Info("deallocate").javaNames("_deallocate"))
        .put(new Info("address").javaNames("_address"))
        .put(new Info("position").javaNames("_position"))
        .put(new Info("limit").javaNames("_limit"))
        .put(new Info("capacity").javaNames("_capacity"))
        .put(new Info("fill").javaNames("_fill"))
        .put(new Info("zero").javaNames("_zero"));

    String normalize(String name, boolean unconst, boolean untemplate) {
        if (name == null || name.length() == 0 || name.startsWith("basic/")) {
            return name;
        }
        boolean foundConst = false, simpleType = true;
        Token[] tokens = new Tokenizer(name).tokenize();
        int n = tokens.length;
        String[] basicTypes = getFirst("basic/types").cppTypes;
        Arrays.sort(basicTypes);
        for (int i = 0; i < n; i++) {
            if (tokens[i].match(Token.CONST, Token.CONSTEXPR)) {
                foundConst = true;
                for (int j = i + 1; j < n; j++) {
                    tokens[j - 1] = tokens[j];
                }
                i--; n--;
            } else if (Arrays.binarySearch(basicTypes, tokens[i].value) < 0) {
                simpleType = false;
                break;
            }
        }
        if (simpleType) {
            Arrays.sort(tokens, 0, n);
            name = (foundConst ? "const " : "") + tokens[0].value;
            for (int i = 1; i < n; i++) {
                name += " " + tokens[i].value;
            }
        } else if (untemplate) {
            int count = 0, template = -1;
            for (int i = 0; i < n; i++) {
                if (tokens[i].match('<')) {
                    if (count == 0) {
                        template = i;
                    }
                    count++;
                } else if (tokens[i].match('>')) {
                    count--;
                    if (count == 0 && i + 1 != n) {
                        template = -1;
                    }
                }
            }
            if (template >= 0) {
                name = foundConst ? "const " : "";
                for (int i = 0; i < template; i++) {
                    name += tokens[i].value;
                }
            }
        }
        if (unconst && foundConst) {
            name = name.substring(name.indexOf("const") + 5);
        }
        return name.trim();
    }

    public List<Info> get(String cppName) {
        return get(cppName, true);
    }
    public List<Info> get(String cppName, boolean partial) {
        String key = normalize(cppName, false, false);
        List<Info> infoList = super.get(key);
        if (infoList == null) {
            key = normalize(cppName, true, false);
            infoList = super.get(key);
        }
        if (infoList == null && partial) {
            key = normalize(cppName, true, true);
            infoList = super.get(key);
        }
        if (infoList == null) {
            infoList = new ArrayList<Info>();
        }
        if (parent != null) {
            List<Info> l = parent.get(cppName, partial);
            if (l != null && l.size() > 0) {
                infoList = new ArrayList<Info>(infoList);
                infoList.addAll(l);
            }
        }
        return infoList;
    }

    public Info get(int index, String cppName) {
        return get(index, cppName, true);
    }
    public Info get(int index, String cppName, boolean partial) {
        List<Info> infoList = get(cppName, partial);
        return infoList.size() > 0 ? infoList.get(index) : null;
    }

    public Info getFirst(String cppName) {
        return getFirst(cppName, true);
    }
    public Info getFirst(String cppName, boolean partial) {
        List<Info> infoList = get(cppName, partial);
        return infoList.size() > 0 ? infoList.get(0) : null;
    }

    public InfoMap put(int index, Info info) {
        for (String cppName : info.cppNames != null ? info.cppNames : new String[] { null }) {
            String[] keys = { normalize(cppName, false, false),
                              normalize(cppName, false, true) };
            for (String key : keys) {
                List<Info> infoList = super.get(key);
                if (infoList == null) {
                    super.put(key, infoList = new ArrayList<Info>());
                }
                if (!infoList.contains(info)) {
                    switch (index) {
                        case -1: infoList.add(info); break;
                        default: infoList.add(index, info); break;
                    }
                }
            }
        }
        return this;
    }

    public InfoMap put(Info info) {
        return put(-1, info);
    }

    public InfoMap putFirst(Info info) {
        return put(0, info);
    }
}
