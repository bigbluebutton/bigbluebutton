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
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;


public class FreeswitchApplication implements ConferenceServiceProvider {
    private static Logger log = Red5LoggerFactory.getLogger(FreeswitchApplication.class, "bigbluebutton");

    private ConnectionManager manager;
    
    private String icecastProtocol = "shout";
    private String icecastHost = "localhost";
    private int icecastPort = 8000;
    private String icecastUsername = "source";
    private String icecastPassword = "hackme";
    private String icecastStreamExtension = ".mp3";
    private Boolean icecastBroadcast = false;
    
    private final Integer USER = 0; /* not used for now */
  
    @Override
    public void populateRoom(String room) {    
    	PopulateRoomCommand prc = new PopulateRoomCommand(room, USER);
    	manager.getUsers(prc);
    }

    @Override
    public void mute(String room, Integer participant, Boolean mute) {
        MuteParticipantCommand mpc = new MuteParticipantCommand(room, participant, mute, USER);
        manager.mute(mpc);
    }

    @Override
    public void eject(String room, Integer participant) {
        EjectParticipantCommand mpc = new EjectParticipantCommand(room, participant, USER);
        manager.eject(mpc);
    }

    @Override
    public void ejectAll(String room) {
        EjectAllUsersCommand mpc = new EjectAllUsersCommand(room, USER);
        manager.ejectAll(mpc);
    }
    
    @Override
    public void record(String room, String meetingid){
    	String RECORD_DIR = "/var/freeswitch/meetings";        
    	String voicePath = RECORD_DIR + File.separatorChar + meetingid + "-" + System.currentTimeMillis() + ".wav";
    	
    	RecordConferenceCommand rcc = new RecordConferenceCommand(room, USER, true, voicePath);
    	
    	manager.record(rcc);
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
    	
        BroadcastConferenceCommand rcc = new BroadcastConferenceCommand(room, USER, true, shoutPath);
        manager.broadcast(rcc);
    }
    
    public void setConnectionManager(ConnectionManager manager) {
        this.manager = manager;
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

	@Override
	public boolean startup() {
		// NO OP
		return false;
	}

	@Override
	public void shutdown() {
		// NO OP
		
	}
    

}