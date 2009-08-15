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

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.manager.EventTimeoutException;

/**
 * Maps exceptions received from
 * {@link org.asteriskjava.manager.ManagerConnection} to the corresponding
 * {@link org.asteriskjava.live.ManagerCommunicationException}.
 * 
 * @author srt
 * @version $Id: ManagerCommunicationExceptionMapper.java 938 2007-12-31 03:23:38Z srt $
 */
class ManagerCommunicationExceptionMapper
{
    // hide constructor
    private ManagerCommunicationExceptionMapper()
    {

    }

    /**
     * Maps exceptions received from
     * {@link org.asteriskjava.manager.ManagerConnection} when sending a
     * {@link org.asteriskjava.manager.action.ManagerAction} to the corresponding
     * {@link org.asteriskjava.live.ManagerCommunicationException}.
     * 
     * @param actionName name of the action that has been tried to send
     * @param exception exception received
     * @return the corresponding ManagerCommunicationException
     */
    static ManagerCommunicationException mapSendActionException(String actionName, Exception exception)
    {
        if (exception instanceof IllegalStateException)
        {
            return new ManagerCommunicationException("Not connected to Asterisk Server", exception);
        }
        else if (exception instanceof EventTimeoutException)
        {
            return new ManagerCommunicationException("Timeout waiting for events from " + actionName + "Action", exception);
        }
        else
        {
            return new ManagerCommunicationException("Unable to send " + actionName + "Action", exception);
        }
    }
}
