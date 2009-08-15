/*
 *  Copyright 2005-2006 Stefan Reuter
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

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ResponseEvents;
import org.asteriskjava.manager.action.EventGeneratingAction;
import org.asteriskjava.manager.action.ManagerAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

class ManagerConnectionPool
{
    private final Log logger = LogFactory.getLog(getClass());
    private final BlockingQueue<ManagerConnection> connections;

    ManagerConnectionPool(int size)
    {
        this.connections = new ArrayBlockingQueue<ManagerConnection>(size);
    }

    void clear()
    {
        connections.clear();
    }

    void add(ManagerConnection connection)
    {
        put(connection);
    }

    ManagerResponse sendAction(ManagerAction action) throws ManagerCommunicationException
    {
        ManagerConnection connection;
        ManagerResponse response;

        connection = get();
        try
        {
            response = connection.sendAction(action);
        }
        catch (Exception e)
        {
            throw ManagerCommunicationExceptionMapper.mapSendActionException(action.getAction(), e);
        }
        finally
        {
            put(connection);
        }

        return response;
    }

    ResponseEvents sendEventGeneratingAction(EventGeneratingAction action) throws ManagerCommunicationException
    {
        return sendEventGeneratingAction(action, -1);
    }

    ResponseEvents sendEventGeneratingAction(EventGeneratingAction action, long timeout)
            throws ManagerCommunicationException
    {
        ManagerConnection connection;
        ResponseEvents responseEvents;

        connection = get();
        try
        {
            if (timeout > 0)
            {
                responseEvents = connection.sendEventGeneratingAction(action, timeout);
            }
            else
            {
                responseEvents = connection.sendEventGeneratingAction(action);
            }
        }
        catch (Exception e)
        {
            throw ManagerCommunicationExceptionMapper.mapSendActionException(action.getAction(), e);
        }
        finally
        {
            put(connection);
        }

        return responseEvents;
    }

    /**
     * Retrieves a connection from the pool.
     * 
     * @return the retrieved connection, or <code>null</code> if interrupted
     *         while waiting for a connection to become available.
     */
    private ManagerConnection get()
    {
        try
        {
            return connections.take();
        }
        catch (InterruptedException e)
        {
            logger.error("Interrupted while waiting for ManagerConnection to become available", e);
            return null;
        }
    }

    private void put(ManagerConnection connection)
    {
        try
        {
            connections.put(connection);
        }
        catch (InterruptedException e)
        {
            throw new RuntimeException("Interrupted while trying to add connection to pool");
        }
    }
}
