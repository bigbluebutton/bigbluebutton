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
package org.asteriskjava.manager.internal;

import java.util.ArrayList;
import java.util.Collection;

import org.asteriskjava.manager.ResponseEvents;
import org.asteriskjava.manager.event.ResponseEvent;
import org.asteriskjava.manager.response.ManagerResponse;


/**
 * Implementation of the ResponseEvents interface.
 * 
 * @author srt
 * @version $Id: ResponseEventsImpl.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public class ResponseEventsImpl implements ResponseEvents
{
    private ManagerResponse response;
    private final Collection<ResponseEvent> events;
    private boolean complete;

    /**
     * Creates a new instance.
     */
    public ResponseEventsImpl()
    {
        this.events = new ArrayList<ResponseEvent>();
        this.complete = false;
    }

    // implementation of the ResponseEvents interface

    public ManagerResponse getResponse()
    {
        return response;
    }

    public Collection<ResponseEvent> getEvents()
    {
        return events;
    }

    public boolean isComplete()
    {
        return complete;
    }

    // helper methods to populate the ResponseEvents object

    /**
     * Sets the ManagerResponse received.
     * 
     * @param response the ManagerResponse received.
     */
    public void setRepsonse(ManagerResponse response)
    {
        this.response = response;
    }

    /**
     * Adds a ResponseEvent that has been received.
     * 
     * @param event the ResponseEvent that has been received.
     */
    public void addEvent(ResponseEvent event)
    {
        synchronized (events)
        {
            events.add(event);
        }
    }

    /**
     * Indicats if all events have been received.
     * 
     * @param complete <code>true</code> if all events have been received,
     *            <code>false</code> otherwise.
     */
    public void setComplete(boolean complete)
    {
        this.complete = complete;
    }
}
