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
 * Author: Richard Alam <ritzalam@gmail.com>
 * 
 * $Id: $
 */
package org.bigbluebutton.webconference.voice.asterisk;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.red5.logging.Red5LoggerFactory;
import org.asteriskjava.manager.action.PingAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerConnectionState;
import org.slf4j.Logger;

public class KeepAlivePing {
	private static Logger log = Red5LoggerFactory.getLogger(KeepAlivePing.class, "bigbluebutton");
	
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable pingProcess;
	private volatile boolean pinging = false;
	
    private static final long DEFAULT_INTERVAL = 20 * 1000L;
    private long interval = DEFAULT_INTERVAL;
    private long timeout = 0;
    private int pingCount = 0;
    
    private final ManagerConnection connection;
    
    public KeepAlivePing(ManagerConnection connection) {
    	this.connection = connection;
    	log.info("KeepAlivePing Created");
    }

	public void start() {
		log.info("KeepAlivePing Starting");
		if (!pinging) {
			pinging = true;
			pingProcess = new Runnable() {
				public void run() {
					pingAsteriskServer();
				}
			};
			exec.execute(pingProcess);
		}	   
	}
   
     /**
      * Adjusts how often a PingAction is sent.
      * <p>
      * Default is 20000ms, i.e. 20 seconds.
      * 
      * @param interval the interval in milliseconds
      */
	public void setInterval(long interval) {
         this.interval = interval;	
	}

     /**
      * Sets the timeout to wait for the ManagerResponse before throwing an
      * exception.
      * <p>
      * If set to 0 the response will be ignored an no exception will be thrown
      * at all.
      * <p>
      * Default is 0.
      * 
      * @param timeout the timeout in milliseconds or 0 to indicate no timeout.
      * @since 0.3
      */
	public void setTimeout(long timeout) {
		this.timeout = timeout;
	}

	public void stop() {
		pinging = false;
	}

	private void pingAsteriskServer() {
		while (pinging) {
			try {
				Thread.sleep(interval);
			} catch (InterruptedException e) { // NOPMD 
				// swallow
				log.info("Interrupted Exception on sending Ping:");
			}

			// exit if die is set
			if (!pinging) {
                 break;
			}

			// skip if not connected
			if (connection.getState() != ManagerConnectionState.CONNECTED) {
				continue;
			}

			ping();
		}
	}

     /**
      * Sends a ping to Asterisk and logs any errors that may occur.
      */
	private void ping() {
		ManagerResponse response;
		try {
			if (timeout <= 0) {
				if (pingCount == 5) { // To minize logging, log only every 5 tries.
					log.debug("Sending Ping");
					pingCount = 0;
				}
				pingCount++;
				
                connection.sendAction(new PingAction(), null);
                pingCount++;
             } else {
             	log.debug("Sending ping response:");
                response = connection.sendAction(new PingAction(), timeout);
                log.debug("Got ping response:" + response);
             }
         } catch (Exception e) {
             log.warn("Exception on sending Ping", e);
         }
     }
}
