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

import java.util.concurrent.atomic.AtomicLong;
import java.util.Set;
import java.util.HashSet;

import org.asteriskjava.manager.action.PingAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

/**
 * A Thread that pings the Asterisk server at a given interval.
 * You can use this to prevent the connection being shut down when there is no
 * traffic.
 * <p>
 * Since 1.0.0 PingThread supports mutliple connections so do don't have to
 * start multiple threads to keep several connections alive. 
 *
 * @author srt
 * @version $Id: PingThread.java 1010 2008-03-31 03:29:09Z srt $
 */
public class PingThread extends Thread
{
    private static final long DEFAULT_INTERVAL = 20 * 1000L;
    private static final long DEFAULT_TIMEOUT = 0L;
    private static final AtomicLong idCounter = new AtomicLong(0);

    /**
     * Instance logger.
     */
    private final Log logger = LogFactory.getLog(getClass());

    private long interval = DEFAULT_INTERVAL;
    private long timeout = DEFAULT_TIMEOUT;
    private volatile boolean die;
    private final Set<ManagerConnection> connections;

    /**
     * Creates a new PingThread. Use {@link #addConnection(ManagerConnection)} to add connections
     * that will be pinged.
     *
     * @since 1.0.0
     */
    public PingThread()
    {
        super();
        this.connections = new HashSet<ManagerConnection>();
        this.die = false;
        long id = idCounter.getAndIncrement();
        setName("Asterisk-Java Ping-" + id);
        setDaemon(true);
    }

    /**
     * Creates a new PingThread that uses the given ManagerConnection.
     *
     * @param connection ManagerConnection that is pinged
     */
    public PingThread(ManagerConnection connection)
    {
        this();
        this.connections.add(connection);
    }

    /**
     * Adjusts how often a PingAction is sent.
     * <p/>
     * Default is 20000ms, i.e. 20 seconds.
     *
     * @param interval the interval in milliseconds
     */
    public void setInterval(long interval)
    {
        this.interval = interval;
    }

    /**
     * Sets the timeout to wait for the ManagerResponse before throwing an
     * excpetion.
     * <p/>
     * If set to 0 the response will be ignored an no exception will be thrown
     * at all.
     * <p/>
     * Default is 0.
     *
     * @param timeout the timeout in milliseconds or 0 to indicate no timeout.
     * @since 0.3
     */
    public void setTimeout(long timeout)
    {
        this.timeout = timeout;
    }

    /**
     * Adds a connection to the list of pinged connections.
     *
     * @param connection the connection to ping.
     * @since 1.0.0
     */
    public void addConnection(ManagerConnection connection)
    {
        synchronized (connections)
        {
            connections.add(connection);
        }
    }

    /**
     * Removes a connection from the list of pinged connections.
     *
     * @param connection the connection that will no longer be pinged.
     * @since 1.0.0
     */
    public void removeConnection(ManagerConnection connection)
    {
        synchronized (connections)
        {
            connections.remove(connection);
        }
    }

    /**
     * Terminates this PingThread.
     */
    public void die()
    {
        this.die = true;
        interrupt();
    }

    @Override
    public void run()
    {
        while (!die)
        {
            try
            {
                sleep(interval);
            }
            catch (InterruptedException e) // NOPMD
            {
                // swallow
            }

            // exit if die is set
            if (die)
            {
                break;
            }

            synchronized (connections)
            {
                for (ManagerConnection c : connections)
                {
                    // skip if not connected
                    if (c.getState() != ManagerConnectionState.CONNECTED)
                    {
                        continue;
                    }

                    ping(c);
                }
            }
        }
    }

    /**
     * Sends a ping to Asterisk and logs any errors that may occur.
     *
     * @param c the connection to ping.
     */
    protected void ping(ManagerConnection c)
    {
        try
        {
            if (timeout <= 0)
            {
                c.sendAction(new PingAction(), null);
            }
            else
            {
                final ManagerResponse response;

                response = c.sendAction(new PingAction(), timeout);
                logger.debug("Ping response '" + response + "' for " + c.toString());
            }
        }
        catch (Exception e)
        {
            logger.warn("Exception on sending Ping to " + c.toString(), e);
        }
    }
}
