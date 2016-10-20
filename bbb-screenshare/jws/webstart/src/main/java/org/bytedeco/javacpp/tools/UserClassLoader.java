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

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;

/**
 * An extension of {@link URLClassLoader} that keeps a list of paths in memory.
 * Adds {@code System.getProperty("user.dir")} as default path if none are added.
 */
class UserClassLoader extends URLClassLoader {
    private List<String> paths = new ArrayList<String>();
    public UserClassLoader() {
        super(new URL[0]);
    }
    public UserClassLoader(ClassLoader parent) {
        super(new URL[0], parent);
    }
    public void addPaths(String ... paths) {
        if (paths == null) {
            return;
        }
        for (String path : paths) {
            File f = new File(path);
            if (!f.exists()) {
                continue;
            }
            this.paths.add(path);
            try {
                addURL(f.toURI().toURL());
            } catch (MalformedURLException e) {
                throw new RuntimeException(e);
            }
        }
    }
    public String[] getPaths() {
        if (paths.isEmpty()) {
            addPaths(System.getProperty("user.dir"));
        }
        return paths.toArray(new String[paths.size()]);
    }
    @Override protected Class<?> findClass(String name)
            throws ClassNotFoundException {
        if (paths.isEmpty()) {
            addPaths(System.getProperty("user.dir"));
        }
        return super.findClass(name);
    }
}
