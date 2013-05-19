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

import java.io.File;
import java.util.Iterator;
import java.util.Map;
import java.util.Observable;
import java.util.logging.Level;
import org.bigbluebutton.webconference.voice.ConferenceServiceProvider;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;
import org.bigbluebutton.webconference.voice.events.StartRecordingEvent;
import org.bigbluebutton.webconference.voice.freeswitch.actions.BroadcastConferenceCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.EjectAllUsersCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.EjectParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.PopulateRoomCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.MuteParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.RecordConferenceCommand;
import org.freeswitch.esl.client.IEslEventListener;
import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.manager.ManagerConnection;
import org.freeswitch.esl.client.transport.event.EslEvent;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.jboss.netty.channel.ExceptionEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;


public class FreeswitchApplication extends Observable implements ConferenceServiceProvider {
    private static Logger log = Red5LoggerFactory.getLogger(FreeswitchApplication.class, "bigbluebutton");

    private ManagerConnection manager;
    
    private FreeswitchHeartbeatMonitor heartbeatMonitor;

    private String icecastProtocol = "shout";
    private String icecastHost = "localhost";
    private int icecastPort = 8000;
    private String icecastUsername = "source";
    private String icecastPassword = "hackme";
    private String icecastStreamExtension = ".mp3";
    private Boolean icecastBroadcast = false;
    
    private final Integer USER = 0; /* not used for now */
  
    
    public void connect() {
    	try {
			manager.connect();
		} catch (InboundConnectionFailure e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
    @Override
    public boolean startup() {    	
        Client c = manager.getESLClient();
        if (c.canSend()) {
            c.addEventListener( this );
            c.cancelEventSubscriptions();
            c.setEventSubscriptions( "plain", "all" );
            c.addEventFilter( "Event-Name", "heartbeat" );
            c.addEventFilter( "Event-Name", "custom" );
            c.addEventFilter( "Event-Name", "background_job" );
            
            try {
                Thread.sleep(5000);
            } catch (InterruptedException ex) {
                java.util.logging.Logger.getLogger(FreeswitchApplication.class.getName()).log(Level.SEVERE, null, ex);
                return false;
            }        	
        }

        //Start Heartbeat and exception Event Observer Monitor
        startHeartbeatMonitor();
        return true;
    }

    private void startHeartbeatMonitor() {      
        if(heartbeatMonitor == null) { //Only startup once. as startup will be called for reconnect.
            heartbeatMonitor = new FreeswitchHeartbeatMonitor(manager, this);
            this.addObserver(heartbeatMonitor);
            heartbeatMonitor.start();
        }   	
    }
    
    @Override
    public void shutdown() {
        heartbeatMonitor.stop();
    }

    @Override
    public void populateRoom(String room) {       
        Client c = manager.getESLClient();
        if (c.canSend()) {
        	PopulateRoomCommand prc = new PopulateRoomCommand(room, USER);
            EslMessage response = c.sendSyncApiCommand(prc.getCommand(), prc.getCommandArgs());
            prc.handleResponse(response, conferenceEventListener);        	
        } else {
        	log.warn("Can't send populate room request to FreeSWITCH as we are not connected.");
        	// Let's see if we can recover the connection.
        	startHeartbeatMonitor();
        }
    }

    @Override
    public void mute(String room, Integer participant, Boolean mute) {
    	Client c = manager.getESLClient();
        if (c.canSend()) {
            MuteParticipantCommand mpc = new MuteParticipantCommand(room, participant, mute, USER);
            String jobId = c.sendAsyncApiCommand( mpc.getCommand(), mpc.getCommandArgs());
            log.debug("mute called for room [{}] jobid [{}]", room, jobId);        	
        }else {
        	log.warn("Can't send mute request to FreeSWITCH as we are not connected.");
        	// Let's see if we can recover the connection.
        	startHeartbeatMonitor();
        }

    }

    @Override
    public void eject(String room, Integer participant) {
        Client c = manager.getESLClient();
        if (c.canSend()) {
        	EjectParticipantCommand mpc = new EjectParticipantCommand(room, participant, USER);
            String jobId = c.sendAsyncApiCommand( mpc.getCommand(), mpc.getCommandArgs());
            log.debug("eject/kick called for room [{}] jobid [{}]", room, jobId);        	
        }else {
        	log.warn("Can't send eject request to FreeSWITCH as we are not connected.");
        	// Let's see if we can recover the connection.
        	startHeartbeatMonitor();
        }
    }

    @Override
    public void ejectAll(String room) {
        Client c = manager.getESLClient();
        if (c.canSend()) {
        	EjectAllUsersCommand mpc = new EjectAllUsersCommand(room, USER);
            String jobId = c.sendAsyncApiCommand( mpc.getCommand(), mpc.getCommandArgs());
            log.debug("eject all user from room [{}], jobid [{}]", room, jobId);        	
        }else {
        	log.warn("Can't send eject request to FreeSWITCH as we are not connected.");
        	// Let's see if we can recover the connection.
        	startHeartbeatMonitor();
        }
    }
    
    @Override
    public void record(String room, String meetingid){
    	String RECORD_DIR = "/var/freeswitch/meetings";        
    	String voicePath = RECORD_DIR + File.separatorChar + meetingid + "-" + System.currentTimeMillis() + ".wav";
    	
    	if (log.isDebugEnabled())
    		log.debug("Asking Freeswitch to start recording in {}", voicePath);
    	
    	Client c = manager.getESLClient();
        if (c.canSend()) {
        	RecordConferenceCommand rcc = new RecordConferenceCommand(room, USER, true, voicePath);
        	log.debug(rcc.getCommand() + " " + rcc.getCommandArgs());
        	EslMessage response = manager.getESLClient().sendSyncApiCommand(rcc.getCommand(), rcc.getCommandArgs());
            rcc.handleResponse(response, conferenceEventListener);       	
        }else {
        	log.warn("Can't send record request to FreeSWITCH as we are not connected.");
        	// Let's see if we can recover the connection.
        	startHeartbeatMonitor();
        }
    }

    @Override
    public void broadcast(String room, String meetingid) {        
        if (icecastBroadcast) {
        	broadcastToIcecast(room, meetingid);
        }
    }
    
    private void broadcastToIcecast(String room, String meetingid) {
    	String shoutPath = icecastProtocol + "://" + icecastUsername + ":" + icecastPassword + "@" + icecastHost + ":" + icecastPort 
    			+ File.separatorChar + meetingid + "." + icecastStreamExtension;       
    	
    	if (log.isDebugEnabled())
    		log.debug("Broadcast to {}", shoutPath);
    	
    	log.debug("Broadcast to {}", shoutPath);
    	
    	Client c = manager.getESLClient();
        if (c.canSend()) {
        	BroadcastConferenceCommand rcc = new BroadcastConferenceCommand(room, USER, true, shoutPath);
        	log.debug(rcc.getCommand() + rcc.getCommandArgs());
        	EslMessage response = manager.getESLClient().sendSyncApiCommand(rcc.getCommand(), rcc.getCommandArgs());
            rcc.handleResponse(response, conferenceEventListener);       	
        }else {
        	log.warn("Can't send record request to FreeSWITCH as we are not connected.");
        	// Let's see if we can recover the connection.
        	startHeartbeatMonitor();
        }    	
    }
    




    public void setManagerConnection(ManagerConnection manager) {
        this.manager = manager;
    }

    public void setConferenceEventListener(ConferenceEventListener listener) {
        this.conferenceEventListener = listener;
    }

    public void setDebugNullConferenceAction(boolean enabled) {
        this.debug = enabled;
    }
    
    public void setIcecastProtocol(String protocol) {
    	icecastProtocol = protocol;
    }
    
    public void setIcecastHost(String host) {
    	icecastHost = host;
    }
    
    public void setIcecastPort(int port) {
    	icecastPort = port;
    }
    
    public void setIcecastUsername(String username) {
    	icecastUsername = username;
    }
    
    public void setIcecastPassword(String password) {
    	icecastPassword = password;
    }
    
    public void setIcecastBroadcast(Boolean broadcast) {
    	icecastBroadcast = broadcast;
    }

    public void setIcecastStreamExtension(String ext) {
    	icecastStreamExtension = ext;
    }
    

}