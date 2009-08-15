/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.live;

import java.beans.PropertyChangeListener;

/**
 * Interface for all live objects.
 * <p>
 * Allows you to retrieve the {@link org.asteriskjava.live.AsteriskServer} this
 * live object belongs to and provides support for
 * {@link java.beans.PropertyChangeEvent}s.
 * 
 * @author srt
 * @version $Id: LiveObject.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.3
 */
public interface LiveObject
{
    /**
     * Returns the AsteriskServer this live object belongs to.
     * 
     * @return the AsteriskServer this live object belongs to.
     */
    AsteriskServer getServer();

    /**
     * Adds a PropertyChangeListener that is notified whenever a property value
     * changes.
     * 
     * @param listener listener to notify
     */
    void addPropertyChangeListener(PropertyChangeListener listener);

    /**
     * Adds a PropertyChangeListener that is notified whenever a given property
     * value changes.
     * 
     * @param propertyName property to observe
     * @param listener listener to notify
     * @see #addPropertyChangeListener(PropertyChangeListener)
     */
    void addPropertyChangeListener(String propertyName, PropertyChangeListener listener);

    /**
     * Removes the given PropertyChangeListener that was added by calling
     * {@link #addPropertyChangeListener(PropertyChangeListener)}.
     * 
     * @param listener listener to remove
     */
    void removePropertyChangeListener(PropertyChangeListener listener);

    /**
     * Removes the given PropertyChangeListener that was added by calling
     * {@link #addPropertyChangeListener(String, PropertyChangeListener)}.
     * 
     * @param propertyName property that is observed
     * @param listener listener to remove
     */
    void removePropertyChangeListener(String propertyName, PropertyChangeListener listener);
}
