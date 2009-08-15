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
package org.asteriskjava.manager.action;

/**
 * With the EventsAction you can specify what kind of events should be sent to
 * this manager connection.
 * 
 * @author srt
 * @version $Id: EventsAction.java 968 2008-02-03 07:48:33Z srt $
 */
public class EventsAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier.
     */
    static final long serialVersionUID = -8042435402644984875L;

    private String eventMask;

    /**
     * Creates a new empty EventsAction.
     */
    public EventsAction()
    {

    }

    /**
     * Creates a new EventsAction that applies the given event mask to the
     * current manager connection.
     * 
     * @param eventMask the event mask. Set to "on" if all events should be
     *            send, "off" if not events should be sent or a combination of
     *            "system", "call" and "log" (separated by ',') to specify what
     *            kind of events should be sent.
     * @since 0.2
     */
    public EventsAction(String eventMask)
    {
        this.eventMask = eventMask;
    }

    /**
     * Returns the name of this action, i.e. "Events".
     */
    @Override
   public String getAction()
    {
        return "Events";
    }

    /**
     * Returns the event mask.
     */
    public String getEventMask()
    {
        return eventMask;
    }

    /**
     * Sets the event mask.<p>
     * Set to "on" if all events should be send, "off" if not events should be
     * sent or a combination of "system", "call" and "log" (separated by ',') to
     * specify what kind of events should be sent.
     */
    public void setEventMask(String eventMask)
    {
        this.eventMask = eventMask;
    }
}
