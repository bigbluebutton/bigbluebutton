/*
 * Copyright (C) 2014-2016 Samuel Audet
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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.jar.JarInputStream;
import java.util.zip.ZipEntry;

/**
 * Given a {@link UserClassLoader}, attempts to match and fill in a {@link Collection}
 * of {@link Class}, in various ways in which users may wish to do so.
 */
class ClassScanner {
    ClassScanner(Logger logger, Collection<Class> classes, UserClassLoader loader) {
        this.logger  = logger;
        this.classes = classes;
        this.loader  = loader;
    }

    final Logger logger;
    final Collection<Class> classes;
    final UserClassLoader loader;

    public Collection<Class> getClasses() {
        return classes;
    }
    public UserClassLoader getClassLoader() {
        return loader;
    }

    public void addClass(String className) throws ClassNotFoundException, NoClassDefFoundError {
        if (className == null) {
            return;
        } else if (className.endsWith(".class")) {
            className = className.substring(0, className.length()-6);
        }
        Class c = Class.forName(className, false, loader);
        if (!classes.contains(c)) {
            classes.add(c);
        }
    }

    public void addMatchingFile(String filename, String packagePath, boolean recursive) throws ClassNotFoundException, NoClassDefFoundError {
        if (filename != null && filename.endsWith(".class") &&
                (packagePath == null || (recursive && filename.startsWith(packagePath)) ||
                filename.regionMatches(0, packagePath, 0, Math.max(filename.lastIndexOf('/'), packagePath.lastIndexOf('/'))))) {
            addClass(filename.replace('/', '.'));
        }
    }

    public void addMatchingDir(String parentName, File dir, String packagePath, boolean recursive) throws ClassNotFoundException, NoClassDefFoundError {
        File[] files = dir.listFiles();
        Arrays.sort(files);
        for (File f : files) {
            String pathName = parentName == null ? f.getName() : parentName + f.getName();
            if (f.isDirectory()) {
                addMatchingDir(pathName + "/", f, packagePath, recursive);
            } else {
                addMatchingFile(pathName, packagePath, recursive);
            }
        }
    }

    public void addPackage(String packageName, boolean recursive) throws IOException, ClassNotFoundException, NoClassDefFoundError {
        String[] paths = loader.getPaths();
        final String packagePath = packageName == null ? null : (packageName.replace('.', '/') + "/");
        int prevSize = classes.size();
        for (String p : paths) {
            File file = new File(p);
            if (file.isDirectory()) {
                addMatchingDir(null, file, packagePath, recursive);
            } else {
                JarInputStream jis = new JarInputStream(new FileInputStream(file));
                ZipEntry e = jis.getNextEntry();
                while (e != null) {
                    addMatchingFile(e.getName(), packagePath, recursive);
                    jis.closeEntry();
                    e = jis.getNextEntry();
                }
                jis.close();
            }
        }
        if (classes.size() == 0 && packageName == null) {
            logger.warn("No classes found in the unnamed package");
            Builder.printHelp();
        } else if (prevSize == classes.size() && packageName != null) {
            logger.warn("No classes found in package " + packageName);
        }
    }

    public void addClassOrPackage(String name) throws IOException, ClassNotFoundException, NoClassDefFoundError {
        if (name == null) {
            return;
        }
        name = name.replace('/', '.');
        if (name.endsWith(".**")) {
            addPackage(name.substring(0, name.length()-3), true);
        } else if (name.endsWith(".*")) {
            addPackage(name.substring(0, name.length()-2), false);
        } else {
            addClass(name);
        }
    }
}
