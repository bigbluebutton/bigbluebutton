/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.webconference.voice.freeswitch;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.manager.ManagerConnection;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ConnectionManager  {
    private static Logger log = Red5LoggerFactory.getLogger(ConnectionManager.class, "bigbluebutton");
    private static final String EVENT_NAME = "Event-Name";
    
	private static final int CONNECT_THREAD = 1;
	private static final ScheduledExecutorService connExec = Executors.newScheduledThreadPool(CONNECT_THREAD);
	
    private ManagerConnection manager;
    private volatile boolean sendMessages = false;
    
    private volatile boolean subscribed = false;
    
    private void connect() {
    	try {
    		Client c = manager.getESLClient();
    		if (! c.canSend()) {
    			subscribed = false;
    			manager.connect();
    		} 
    		
    		if (!subscribed) {
                c.cancelEventSubscriptions();
                c.setEventSubscriptions( "plain", "all" );
                c.addEventFilter( EVENT_NAME, "heartbeat" );
                c.addEventFilter( EVENT_NAME, "custom" );
                c.addEventFilter( EVENT_NAME, "background_job" );
                subscribed = true;
    		}
    		
		} catch (InboundConnectionFailure e) {
			log.error("Failed to connect to ESL");
		}
    }
    
	public void start() {
		sendMessages = true;
		Runnable sender = new Runnable() {
			public void run() {
				while (sendMessages) {					
					connect();	
				}
			}
		};
		connExec.scheduleWithFixedDelay(sender, 0, 5, TimeUnit.SECONDS);	
	}
	
	public void stop() {
		sendMessages = false;
	}
	
    public void setManagerConnection(ManagerConnection manager) {
    	this.manager = manager;
    }
}