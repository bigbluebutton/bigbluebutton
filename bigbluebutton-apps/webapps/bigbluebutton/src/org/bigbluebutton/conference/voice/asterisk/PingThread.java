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
package org.bigbluebutton.conference.voice.asterisk;

import java.util.concurrent.atomic.AtomicLong;

import org.asteriskjava.manager.action.PingAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerConnectionState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A Thread that pings the Asterisk server at a given interval.
 * <p>
 * You can use this to prevent the connection being shut down when there is no
 * traffic.
 * 
 * @author srt
 * @version $Id: PingThread.java 729 2007-05-26 05:16:57Z sprior $
 */
public class PingThread extends Thread
{
    /**
     * Default value for the interval attribute.
     */
    private static final long DEFAULT_INTERVAL = 20 * 1000L;
    private static final AtomicLong idCounter = new AtomicLong(0);

    /**
     * Instance logger.
     */
    protected static Logger logger = LoggerFactory.getLogger(PingThread.class);

    private final long id;
    private long interval = DEFAULT_INTERVAL;
    private long timeout = 0;
    private boolean die;
    private final ManagerConnection connection;

    /**
     * Creates a new PingThread that uses the given ManagerConnection.
     * 
     * @param connection ManagerConnection that is pinged
     */
    public PingThread(ManagerConnection connection)
    {
        super();
        this.connection = connection;
        this.die = false;
        this.id = idCounter.getAndIncrement();
        setName("Asterisk-Conference Ping-" + id);
        setDaemon(true);
    }

    /**
     * Adjusts how often a PingAction is sent.
     * <p>
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
     * <p>
     * If set to 0 the response will be ignored an no exception will be thrown
     * at all.
     * <p>
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
//            	System.out.println("Interrupted Exception on sending Ping:");
            }

            // exit if die is set
            if (die)
            {
                break;
            }

            // skip if not connected
            if (connection.getState() != ManagerConnectionState.CONNECTED)
            {
                continue;
            }

            ping();
        }
    }

    /**
     * Sends a ping to Asterisk and logs any errors that may occur.
     */
    protected void ping()
    {
        ManagerResponse response;
        try
        {
            if (timeout <= 0)
            {
//            	System.out.println("Sending Ping");
                connection.sendAction(new PingAction(), null);
            }
            else
            {
//            	System.out.println("Sending ping response:");
                response = connection.sendAction(new PingAction(), timeout);
//                System.out.println("Got ping response:" + response);
//                logger.debug("Ping response: " + response);
            }
        }
        catch (Exception e)
        {
//        	System.out.println("Exception on sending Ping:");
            logger.warn("Exception on sending Ping", e);
        }
    }
}
