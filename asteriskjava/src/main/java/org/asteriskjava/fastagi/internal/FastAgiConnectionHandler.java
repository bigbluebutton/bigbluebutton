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
package org.asteriskjava.fastagi.internal;

import java.io.IOException;

import org.asteriskjava.fastagi.MappingStrategy;
import org.asteriskjava.util.SocketConnectionFacade;

/**
 * An AgiConnectionHandler for FastAGI.
 * <p>
 * It reads the request using a FastAgiReader and runs the AgiScript configured to
 * handle this type of request. Finally it closes the socket connection.
 *
 * @author srt
 * @version $Id: FastAgiConnectionHandler.java 1091 2008-08-09 01:44:37Z sprior $
 */
public class FastAgiConnectionHandler extends AgiConnectionHandler
{
    /**
     * The socket connection.
     */
    private final SocketConnectionFacade socket;

    /**
     * Creates a new FastAGIConnectionHandler to handle the given FastAGI socket connection.
     *
     * @param mappingStrategy the strategy to use to determine which script to run.
     * @param socket the socket connection to handle.
     */
    public FastAgiConnectionHandler(MappingStrategy mappingStrategy, SocketConnectionFacade socket)
    {
        super(mappingStrategy);
        this.socket = socket;
    }

    @Override
    protected AgiReader createReader()
    {
        return new FastAgiReader(socket);
    }

    @Override
    protected AgiWriter createWriter()
    {
        return new FastAgiWriter(socket);
    }

    @Override
    protected void release()
    {
        try
        {
            socket.close();
        }
        catch (IOException e) // NOPMD
        {
            // swallow
        }
    }
}