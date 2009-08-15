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
package org.asteriskjava.live.internal;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

import org.asteriskjava.live.AsteriskServer;
import org.asteriskjava.live.LiveObject;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

/**
 * Abstract base class for all live objects.
 * 
 * @author srt
 * @since 0.3
 */
abstract class AbstractLiveObject implements LiveObject
{
    private final Log logger = LogFactory.getLog(this.getClass());
    private final PropertyChangeSupport changes;
    protected final AsteriskServerImpl server;

    AbstractLiveObject(AsteriskServerImpl server)
    {
        this.server = server;
        this.changes = new PropertyChangeSupport(this);
    }

    public AsteriskServer getServer()
    {
        return server;
    }

    public void addPropertyChangeListener(PropertyChangeListener listener)
    {
        changes.addPropertyChangeListener(listener);
    }

    public void addPropertyChangeListener(String propertyName, PropertyChangeListener listener)
    {
        changes.addPropertyChangeListener(propertyName, listener);
    }

    public void removePropertyChangeListener(PropertyChangeListener listener)
    {
        changes.removePropertyChangeListener(listener);
    }

    public void removePropertyChangeListener(String propertyName, PropertyChangeListener listener)
    {
        changes.removePropertyChangeListener(propertyName, listener);
    }
    
    protected void firePropertyChange(String propertyName, Object oldValue, Object newValue)
    {
        if (oldValue != null || newValue != null)
        {
            try
            {
                changes.firePropertyChange(propertyName, oldValue, newValue);
            }
            catch (Exception e)
            {
                logger.warn("Uncaught exception in PropertyChangeListener", e);
            }
        }
    }
}
