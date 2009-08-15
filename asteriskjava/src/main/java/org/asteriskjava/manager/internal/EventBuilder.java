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

import java.util.Map;

import org.asteriskjava.manager.event.ManagerEvent;


/**
 * Transforms maps of attributes to instances of ManagerEvent.
 * 
 * @see org.asteriskjava.manager.event.ManagerEvent
 * @author srt
 * @version $Id: EventBuilder.java 1154 2008-08-24 02:05:26Z srt $
 */
interface EventBuilder
{
    /**
     * Registers a new event class. The event this class is registered for is
     * simply derived from the name of the class by stripping any package name
     * (if present) and stripping the sufffix "Event". For example
     * <code>org.asteriskjava.manager.event.JoinEvent</code> is registered for
     * the event "Join".
     * <p>
     * The event class must be a concrete class with a default constructor
     * (one that takes no arguments).
     * 
     * @param clazz the event class to register, must extend {@link ManagerEvent}.
     * @throws IllegalArgumentException if clazz is not a valid event class
     */
    void registerEventClass(Class<? extends ManagerEvent> clazz) throws IllegalArgumentException;

    /**
     * Builds the event based on the given map of attributes and the registered
     * event classes.
     * 
     * @param source source attribute for the event
     * @param attributes map containing event attributes
     * @return a concrete instance of ManagerEvent or <code>null</code> if no
     *         event class was registered for the event type.
     */
    ManagerEvent buildEvent(Object source, Map<String, Object> attributes);
}
