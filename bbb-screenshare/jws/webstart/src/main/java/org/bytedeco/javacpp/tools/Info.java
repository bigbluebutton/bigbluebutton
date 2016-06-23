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

import org.bytedeco.javacpp.Pointer;
import org.bytedeco.javacpp.annotation.ByVal;
import org.bytedeco.javacpp.annotation.Cast;
import org.bytedeco.javacpp.annotation.Virtual;

/**
 * Holds information useful to the {@link Parser} and associated with C++ identifiers.
 * Info objects are meant to be added by the user to an {@link InfoMap} passed as
 * argument to {@link InfoMapper#map(InfoMap)}. A class inheriting from the latter
 * becomes a kind of configuration file entirely written in Java.
 * <p>
 * For usage examples, one can refer to the source code of the default values defined
 * in the initializer of {@link InfoMap#defaults}.
 *
 * @author Samuel Audet
 */
public class Info {
    public Info() { }
    public Info(String ... cppNames) { this.cppNames = cppNames; }
    public Info(Info i) {
        cppNames = i.cppNames != null ? i.cppNames.clone() : null;
        javaNames = i.javaNames != null ? i.javaNames.clone() : null;
        annotations = i.annotations != null ? i.annotations.clone() : null;
        cppTypes = i.cppTypes != null ? i.cppTypes.clone() : null;
        valueTypes = i.valueTypes != null ? i.valueTypes.clone() : null;
        pointerTypes = i.pointerTypes != null ? i.pointerTypes.clone() : null;
        cast = i.cast;
        define = i.define;
        flatten = i.flatten;
        translate = i.translate;
        skip = i.skip;
        purify = i.purify;
        virtualize = i.virtualize;
        base = i.base;
        cppText = i.cppText;
        javaText = i.javaText;
    }

    /** A list of C++ identifiers or expressions to which this info is to be bound.
     * Usually set via the constructor parameter of {@link #Info(String...)}. */
    String[] cppNames = null;
    /** The Java identifiers to output corresponding to the C++ identifiers of {@link #cppNames}.
     * By default, the names of C++ identifiers {@link #cppNames} are used. */
    String[] javaNames = null;
    /** Additional Java annotations that should prefix the identifiers on output. */
    String[] annotations = null;
    /** A list of C++ types to supply to or substitute from macros, templates, typedefs, etc.
     * By default, identifiers with missing type information are skipped, except for
     * variable-like macros for which the type is guessed based on the expression. */
    String[] cppTypes = null;
    /** A list of (usually) primitive Java types to be used to map C++ value types.
     * By default, {@link #pointerTypes} prefixed with @{@link ByVal} are used. */
    String[] valueTypes = null;
    /** A list of (usually) {@link Pointer} Java subclasses to be used to map C++ pointer types.
     * By default, the names of the C++ types {@link #cppNames} are used. */
    String[] pointerTypes = null;
    /** Annotates Java identifiers with @{@link Cast} containing C++ identifier names {@link #cppNames}. */
    boolean cast = false;
    /** Indicates expressions of conditional macro groups to parse, or templates to specialize. */
    boolean define = false;
    /** Outputs declarations for this class into their subclasses as well.
     * Also adds methods for explicit casting, as done for multiple inheritance by default. */
    boolean flatten = false;
    /** Attempts to translate naively the statements of variable-like macros to Java. */
    boolean translate = false;
    /** Skips entirely all the code associated with the C++ identifiers.
     * Unless more {@link Info} is provided... */
    boolean skip = false;
    /** Forces a class to be treated as if it were abstract. */
    boolean purify = false;
    /** Annotates virtual functions with @{@link Virtual} and adds appropriate constructors. */
    boolean virtualize = false;
    /** Allows to override the base class of {@link #pointerTypes}. Defaults to {@link Pointer}. */
    String base = null;
    /** Replaces the code associated with the declaration of C++ identifiers, before parsing. */
    String cppText = null;
    /** Outputs the given code, instead of the result parsed from the declaration of C++ identifiers. */
    String javaText = null;

    public Info cppNames(String ... cppNames) { this.cppNames = cppNames; return this; }
    public Info javaNames(String ... javaNames) { this.javaNames = javaNames; return this; }
    public Info annotations(String ... annotations) { this.annotations = annotations; return this; }
    public Info cppTypes(String ... cppTypes) { this.cppTypes = cppTypes; return this; }
    public Info valueTypes(String ... valueTypes) { this.valueTypes = valueTypes; return this; }
    public Info pointerTypes(String ... pointerTypes) { this.pointerTypes = pointerTypes; return this; }
    public Info cast() { this.cast = true; return this;  }
    public Info cast(boolean cast) { this.cast = cast; return this;  }
    public Info define() { this.define = true; return this; }
    public Info define(boolean define) { this.define = define; return this; }
    public Info flatten() { this.flatten = true; return this; }
    public Info flatten(boolean flatten) { this.flatten = flatten; return this; }
    public Info translate() { this.translate = true; return this; }
    public Info translate(boolean translate) { this.translate = translate; return this; }
    public Info skip() { this.skip = true; return this; }
    public Info skip(boolean skip) { this.skip = skip; return this; }
    public Info purify() { this.purify = true; return this; }
    public Info purify(boolean purify) { this.purify = purify; return this; }
    public Info virtualize() { this.virtualize = true; return this; }
    public Info virtualize(boolean virtualize) { this.virtualize = virtualize; return this; }
    public Info base(String base) { this.base = base; return this; }
    public Info cppText(String cppText) { this.cppText = cppText; return this; }
    public Info javaText(String javaText) { this.javaText = javaText; return this; }
}
