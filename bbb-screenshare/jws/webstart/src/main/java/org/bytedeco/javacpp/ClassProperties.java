/*
 * Copyright (C) 2011-2014 Samuel Audet
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

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import org.bytedeco.javacpp.annotation.Platform;

/**
 * Does the heavy lifting of collecting values off Properties annotations found
 * on enclosing classes. Operates for the desired "platform" value specified
 * in {@link java.util.Properties}. As a {@link HashMap}, it makes the result
 * easily accessible, and mutable.
 *
 * @see Loader#loadProperties(Class, java.util.Properties, boolean)
 */
public class ClassProperties extends HashMap<String,List<String>> {
    public ClassProperties() { }
    public ClassProperties(Properties properties) {
        platform      = properties.getProperty("platform");
        platformRoot  = properties.getProperty("platform.root");
        pathSeparator = properties.getProperty("platform.path.separator");
        if (platformRoot == null || platformRoot.length() == 0) {
            platformRoot = ".";
        }
        if (!platformRoot.endsWith(File.separator)) {
            platformRoot += File.separator;
        }
        for (Map.Entry e : properties.entrySet()) {
            String k = (String)e.getKey(), v = (String)e.getValue();
            if (v == null || v.length() == 0) {
                continue;
            }
            if (k.equals("platform.includepath") || k.equals("platform.include") ||
                    k.equals("platform.linkpath") || k.equals("platform.link") ||
                    k.equals("platform.preloadpath") || k.equals("platform.preload") ||
                    k.equals("platform.frameworkpath") || k.equals("platform.framework") ||
                    k.equals("platform.library.suffix")) {
                addAll(k, v.split(pathSeparator));
            } else {
                setProperty(k, v);
            }
        }
    }

    String[] defaultNames = {};
    String platform, platformRoot, pathSeparator;
    List<Class> inheritedClasses = null;
    List<Class> effectiveClasses = null;
    boolean loaded = false;

    public List<String> get(String key) {
        List<String> list = super.get(key);
        if (list == null) {
            put((String)key, list = new ArrayList<String>());
        }
        return list;
    }

    public void addAll(String key, String ... values) {
        if (values != null) {
            addAll(key, Arrays.asList(values));
        }
    }
    public void addAll(String key, Collection<String> values) {
        if (values != null) {
            String root = null;
            if (key.equals("platform.compiler") || key.equals("platform.sysroot") ||
                    key.equals("platform.includepath") || key.equals("platform.linkpath")) {
                root = platformRoot;
            }

            List<String> values2 = get(key);
            for (String value : values) {
                if (value == null) {
                    continue;
                }
                if (root != null && !new File(value).isAbsolute() &&
                        new File(root + value).exists()) {
                    value = root + value;
                }
                if (!values2.contains(value)) {
                    values2.add(value);
                }
            }
        }
    }

    public String getProperty(String key) {
        return getProperty(key, null);
    }
    public String getProperty(String key, String defaultValue) {
        List<String> values = get(key);
        return values.isEmpty() ? defaultValue : values.get(0);
    }
    public String setProperty(String key, String value) {
        List<String> values = get(key);
        String oldValue = values.isEmpty() ? null : values.get(0);
        values.clear();
        addAll(key, value);
        return oldValue;
    }

    public void load(Class cls, boolean inherit) {
        Class<?> c = Loader.getEnclosingClass(cls);
        List<Class> classList = new ArrayList<Class>();
        classList.add(0, c);
        while (!c.isAnnotationPresent(org.bytedeco.javacpp.annotation.Properties.class)
                && !c.isAnnotationPresent(Platform.class) && c.getSuperclass() != null
                && c.getSuperclass() != Object.class) {
            // accumulate superclasses to process native methods from those as well
            classList.add(0, c = c.getSuperclass());
        }
        if (effectiveClasses == null) {
            effectiveClasses = classList;
        }
        org.bytedeco.javacpp.annotation.Properties classProperties =
                c.getAnnotation(org.bytedeco.javacpp.annotation.Properties.class);
        Platform[] platforms = null;
        if (classProperties == null) {
            Platform platform = c.getAnnotation(Platform.class);
            if (platform != null) {
                platforms = new Platform[] { platform };
            }
        } else {
            Class[] classes = classProperties.inherit();
            if (inherit && classes != null) {
                if (inheritedClasses == null) {
                    inheritedClasses = new ArrayList<Class>();
                }
                for (Class c2 : classes) {
                    load(c2, inherit);
                    if (!inheritedClasses.contains(c2)) {
                        inheritedClasses.add(c2);
                    }
                }
            }
            String target = classProperties.target();
            if (target.length() > 0) {
                addAll("target", target);
            }
            String helper = classProperties.helper();
            if (helper.length() > 0) {
                addAll("helper", helper);
            }
            String[] names = classProperties.names();
            if (names.length > 0) {
                defaultNames = names;
            }
            platforms = classProperties.value();
        }

        String[] pragma = {}, define = {}, include = {}, cinclude = {}, includepath = {}, compiler = {},
                 linkpath = {}, link = {}, frameworkpath = {}, framework = {}, preloadpath = {}, preload = {};
        String library = "jni" + c.getSimpleName();
        for (Platform p : platforms != null ? platforms : new Platform[0]) {
            String[][] names = { p.value().length > 0 ? p.value() : defaultNames, p.not() };
            boolean[] matches = { false, false };
            for (int i = 0; i < names.length; i++) {
                for (String s : names[i]) {
                    if (platform.startsWith(s)) {
                        matches[i] = true;
                        break;
                    }
                }
            }
            if ((names[0].length == 0 || matches[0]) && (names[1].length == 0 || !matches[1])) {
                if (p.pragma()     .length > 0) { pragma      = p.pragma();      }
                if (p.define()     .length > 0) { define      = p.define();      }
                if (p.include()    .length > 0) { include     = p.include();     }
                if (p.cinclude()   .length > 0) { cinclude    = p.cinclude();    }
                if (p.includepath().length > 0) { includepath = p.includepath(); }
                if (p.compiler()   .length > 0) { compiler    = p.compiler();    }
                if (p.linkpath()   .length > 0) { linkpath    = p.linkpath();    }
                if (p.link()       .length > 0) { link        = p.link();        }
                if (p.frameworkpath().length > 0) { frameworkpath = p.frameworkpath(); }
                if (p.framework()  .length > 0) { framework   = p.framework();   }
                if (p.preloadpath().length > 0) { preloadpath = p.preloadpath(); }
                if (p.preload()    .length > 0) { preload     = p.preload();     }
                if (p.library().length() > 0)   { library     = p.library();     }
            }
        }
        addAll("platform.pragma", pragma);
        addAll("platform.define", define);
        addAll("platform.include", include);
        addAll("platform.cinclude", cinclude);
        addAll("platform.includepath", includepath);
        addAll("platform.compiler.*", compiler);
        addAll("platform.linkpath", linkpath);
        addAll("platform.link", link);
        addAll("platform.frameworkpath", frameworkpath);
        addAll("platform.framework", framework);
        addAll("platform.preloadpath", preloadpath);
        addAll("platform.preload", preload);
        setProperty("platform.library", library);

        if (platforms != null && platforms.length > 0) {
            loaded = true;
        }
    }

    public List<Class> getInheritedClasses() {
        return inheritedClasses;
    }

    public List<Class> getEffectiveClasses() {
        return effectiveClasses;
    }

    public boolean isLoaded() {
        return loaded;
    }
}
