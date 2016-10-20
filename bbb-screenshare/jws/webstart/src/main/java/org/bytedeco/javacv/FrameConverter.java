/*
 * Copyright (C) 2015 Samuel Audet
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

package org.bytedeco.javacv;

/**
 * Defines two methods to convert between a {@link Frame} and another generic
 * data object that can contain the same data. The idea with this design is
 * to allow users to convert easily between multiple potentially mutually
 * exclusive types of image data objects over which we have no control. Because
 * of this, and for performance reasons, any object returned by this class is
 * guaranteed to remain valid only until the next call to {@code convert()},
 * anywhere in a chain of {@code FrameConverter} objects, and only as long as
 * the latter themselves are not garbage collected.
 *
 * @author Samuel Audet
 */
public abstract class FrameConverter<F> {
    protected Frame frame;

    public abstract Frame convert(F f);
    public abstract F convert(Frame frame);
}
