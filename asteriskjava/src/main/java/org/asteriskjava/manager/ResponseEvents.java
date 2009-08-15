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
package org.asteriskjava.manager;

import java.util.Collection;

import org.asteriskjava.manager.event.ResponseEvent;
import org.asteriskjava.manager.response.ManagerResponse;


/**
 * Contains the result of executing an 
 * {@link org.asteriskjava.manager.action.EventGeneratingAction}, that is the
 * {@link org.asteriskjava.manager.response.ManagerResponse} and any received 
 * {@link org.asteriskjava.manager.event.ManagerEvent}s.
 * 
 * @see org.asteriskjava.manager.action.EventGeneratingAction
 * @author srt
 * @version $Id: ResponseEvents.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.2
 */
public interface ResponseEvents
{
    /**
     * Returns the response received.
     * 
     * @return the response received.
     */
    ManagerResponse getResponse();

    /**
     * Returns a Collection of ManagerEvents that have been received including
     * the last one that indicates completion.
     * 
     * @return a Collection of ManagerEvents received.
     */
    Collection<ResponseEvent> getEvents();
}
