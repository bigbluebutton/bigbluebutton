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
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.freeswitch.actions.BroadcastConferenceCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.EjectAllUsersCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.EjectParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.MuteParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.PopulateRoomCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.RecordConferenceCommand;
import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.manager.ManagerConnection;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ConnectionManager  {
    private static Logger log = Red5LoggerFactory.getLogger(ConnectionManager.class, "bigbluebutton");
    private static final String EVENT_NAME = "Event-Name";
    
	private static final ScheduledExecutorService connExec = Executors.newSingleThreadScheduledExecutor();
	
    private ManagerConnection manager;
    private ScheduledFuture<ConnectThread> connectTask;
    
    private volatile boolean subscribed = false;
    
    private ConferenceEventListener conferenceEventListener;
    private ESLEventListener eslEventListener;
    
    private void connect() {
    	try {
    		Client c = manager.getESLClient();
    		if (! c.canSend()) {
				log.info("Attempting to connect to FreeSWITCH ESL");
    			subscribed = false;
    			manager.connect();
    		} else {
	    		if (!subscribed) {
	    			log.info("Subscribing for ESL events.");
	                c.cancelEventSubscriptions();
	                c.addEventListener(eslEventListener);
	                c.setEventSubscriptions( "plain", "all" );
	                c.addEventFilter( EVENT_NAME, "heartbeat" );
	                c.addEventFilter( EVENT_NAME, "custom" );
	                c.addEventFilter( EVENT_NAME, "background_job" );
	                subscribed = true;
	    		} 
	    	}    		
		} catch (InboundConnectionFailure e) {
			System.out.println("Failed to connect to ESL");
			log.error("Failed to connect to ESL");
		}
    }
    
	public void start() {
		log.info("Starting FreeSWITCH ESL connection manager.");
		System.out.println("***************** Starting FreeSWITCH ESL connection manager.");
		ConnectThread connector = new ConnectThread();
		connectTask = (ScheduledFuture<ConnectThread>) connExec.scheduleAtFixedRate(connector, 5, 5, TimeUnit.SECONDS);	
	}
	
	public void stop() {
		if (connectTask != null) {
			connectTask.cancel(true);
		}		
	}
	
	private class ConnectThread implements Runnable {
		public void run() {
			connect();
		}
	}
	
	
	public void broadcast(BroadcastConferenceCommand rcc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
	    	EslMessage response = c.sendSyncApiCommand(rcc.getCommand(), rcc.getCommandArgs());
	        rcc.handleResponse(response, conferenceEventListener); 	
		}
	}
	
	public void getUsers(PopulateRoomCommand prc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
	        EslMessage response = c.sendSyncApiCommand(prc.getCommand(), prc.getCommandArgs());
	        prc.handleResponse(response, conferenceEventListener); 			
		}
	}
	
	public void mute(MuteParticipantCommand mpc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
	        c.sendAsyncApiCommand( mpc.getCommand(), mpc.getCommandArgs());			
		}
	}
	
	public void eject(EjectParticipantCommand mpc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
			c.sendAsyncApiCommand( mpc.getCommand(), mpc.getCommandArgs());
		}       
	}
	
	public void ejectAll(EjectAllUsersCommand mpc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
	        c.sendAsyncApiCommand( mpc.getCommand(), mpc.getCommandArgs());	
		}
	}
	
	public void record(RecordConferenceCommand rcc) {
		Client c = manager.getESLClient();
		if (c.canSend()) {
	    	EslMessage response = c.sendSyncApiCommand(rcc.getCommand(), rcc.getCommandArgs());
	        rcc.handleResponse(response, conferenceEventListener); 			
		}
	}
	
    public void setManagerConnection(ManagerConnection manager) {
    	this.manager = manager;
    }
    
    public void setESLEventListener(ESLEventListener listener) {
    	this.eslEventListener = listener;
    }
    
    public void setConferenceEventListener(ConferenceEventListener listener) {
        this.conferenceEventListener = listener;
    }
    
}