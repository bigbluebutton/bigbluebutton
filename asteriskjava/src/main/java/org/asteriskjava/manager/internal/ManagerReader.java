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

import java.io.IOException;

import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.SocketConnectionFacade;

/**
 * The ManagerReader reads events and responses from the asterisk server, parses
 * them using EventBuilderImpl and ResponseBuilder and dispatches them to the
 * associated ManagerConnection.<p>
 * Do not use this interface in your code, it is intended to be used only by the
 * DefaultManagerConnection.
 *
 * @author srt
 * @version $Id: ManagerReader.java 1155 2008-08-25 20:22:46Z srt $
 * @see org.asteriskjava.manager.internal.EventBuilder
 * @see org.asteriskjava.manager.internal.ResponseBuilder
 * @see org.asteriskjava.manager.DefaultManagerConnection
 */
public interface ManagerReader extends Runnable
{
    String COMMAND_RESULT_RESPONSE_KEY = "__result__";

    /**
     * Sets the socket to use for reading from the asterisk server.
     *
     * @param socket the socket to use for reading from the asterisk server.
     */
    void setSocket(final SocketConnectionFacade socket);

    /**
     * Registers a new event type with the underlying EventBuilderImpl.<p>
     * The eventClass must extend ManagerEvent.
     *
     * @param event class of the event to register.
     * @see EventBuilder
     * @see ManagerEvent
     */
    void registerEventClass(Class<? extends ManagerEvent> event);

    void expectResponseClass(String internalActionId, Class<? extends ManagerResponse> responseClass);

    /**
     * Terminates this reader.
     */
    void die();

    /**
     * Checks whether this reader is terminating or terminated.
     *
     * @return <code>true</code> if this reader is terminating or terminated,
     *         <code>false</code> otherwise.
     */
    boolean isDead();

    /**
     * Returns the Exception that caused this reader to terminate if any.
     *
     * @return the Exception that caused this reader to terminate if any or <code>null</code> if not.
     */
    IOException getTerminationException();
}
