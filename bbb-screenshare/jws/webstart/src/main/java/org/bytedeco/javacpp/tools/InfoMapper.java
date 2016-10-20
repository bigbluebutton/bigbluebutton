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

import org.bytedeco.javacpp.annotation.Properties;

/**
 * An interface to define a kind of configuration file entirely written in Java.
 * A class implementing this interface can be passed to the {@link Parser}, which
 * will create an instance of the class before calling the {@link #map(InfoMap)}
 * method, to be filled in with {@link Info} objects defined by the user.
 * <p>
 * A class further annotated with {@link Properties#target()} gets detected by
 * the {@link Builder}, which then delegates it to the {@link Parser}.
 *
 * @author Samuel Audet
 */
public interface InfoMapper {
    void map(InfoMap infoMap);
}
