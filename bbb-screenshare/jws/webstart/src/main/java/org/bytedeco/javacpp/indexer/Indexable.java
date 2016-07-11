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

package org.bytedeco.javacpp.indexer;

/**
 * An interface implemented to let users access data classes via an {@link Indexer}.
 * The class implementing this interface can choose the type (byte, short, etc.) of
 * the indexer, and whether it is array-based or direct. The {@link Indexer#release()}
 * method should also be overridden to copy back any data written in the case of
 * non-direct indexers.
 *
 * @author Samuel Audet
 */
public interface Indexable {
    /**
     * Factory method called by the user to get an indexer to access the data.
     * Eventually, {@link Indexer#release()} should be called to have changes
     * reflected in the underlying data.
     *
     * @param <I> the type of the returned object
     * @param direct a hint for the implementation, leaving the choice up to the user, since
     *               buffers are slower than arrays on Android, but not with OpenJDK, for example
     * @return a concrete {@link Indexer}
     */
    <I extends Indexer> I createIndexer(boolean direct);
}
