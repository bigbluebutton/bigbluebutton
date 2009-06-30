/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */

package org.bigbluebutton.conference.service.voice.asterisk

import java.util.concurrent.atomic.AtomicLong;
import org.red5.logging.Red5LoggerFactory
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
public class PingThread extends Thread {
    /**
     * Default value for the interval attribute.
     */
    private static final long DEFAULT_INTERVAL = 20 * 1000L;
    private static final AtomicLong idCounter = new AtomicLong(0);

    /**
     * Instance logger.
     */
     private static Logger log = Red5LoggerFactory.getLogger(PingThread.class, "bigbluebutton");

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
         setName("Asterisk-Java Ping-" + id);
         log.info("PingThread Created");
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
             	log.info("Interrupted Exception on sending Ping:");
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
             	log.debug("Sending Ping");
                connection.sendAction(new PingAction(), null);
             }
             else
             {
             	log.debug("Sending ping response:");
                 response = connection.sendAction(new PingAction(), timeout);
                 log.debug("Got ping response:" + response);
             }
         }
         catch (Exception e)
         {
             log.warn("Exception on sending Ping", e);
         }
     }	
	
}
