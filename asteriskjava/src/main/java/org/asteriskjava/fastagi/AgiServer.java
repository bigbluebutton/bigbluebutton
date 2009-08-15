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
package org.asteriskjava.fastagi;

import java.io.IOException;

/**
 * Listens for incoming AGI connections, reads the inital data and builds an
 * {@link AgiRequest} that is then handed over to the appropriate 
 * {@link org.asteriskjava.fastagi.AgiScript} for processing.
 * 
 * @see org.asteriskjava.fastagi.AgiServerThread
 * @author srt
 * @version $Id: AgiServer.java 938 2007-12-31 03:23:38Z srt $
 */
public interface AgiServer
{
    /**
     * Starts this AgiServer.<p>
     * After calling startup() this AgiServer is ready to receive requests from
     * Asterisk servers and process them.<p>
     * Note that this method will not return until the AgiServer has been shut down.
     * If you want to run the AgiServer in the background use wrap it with an 
     * {@link AgiServerThread}.
     * 
     * @throws IOException if the server socket cannot be bound.
     * @throws IllegalStateException if this AgiServer is already running.
     */
    void startup() throws IOException, IllegalStateException;

    /**
     * Stops this AgiServer.<p>
     * The server socket is closed, new connections are refused and resources 
     * are freed. Any running {@link AgiScript}s are finish before shutdown
     * completes.
     * 
     * @throws IllegalStateException if this AgiServer is already shut down or
     *             has not yet been started.
     */
    void shutdown() throws IllegalStateException;
}
