/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.webconference.voice.freeswitch;

import java.io.File;
import java.util.Collections;
import java.util.HashMap;
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
import org.bigbluebutton.webconference.voice.freeswitch.actions.EjectParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.PopulateRoomCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.MuteParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.RecordConferenceCommand;
import org.freeswitch.esl.client.IEslEventListener;
import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.manager.ManagerConnection;
import org.freeswitch.esl.client.transport.event.EslEvent;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.jboss.netty.channel.ExceptionEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;


public class FreeswitchApplication extends Observable implements ConferenceServiceProvider, IEslEventListener {
    private static Logger log = Red5LoggerFactory.getLogger(FreeswitchApplication.class, "bigbluebutton");

    private ManagerConnection manager;
    private ConferenceEventListener conferenceEventListener;
    private FreeswitchHeartbeatMonitor heartbeatMonitor;
    private boolean debug = false;

    private final Integer USER = 0; /* not used for now */
  
    private static final String START_TALKING_EVENT = "start-talking";
    private static final String STOP_TALKING_EVENT = "stop-talking";
    private static final String START_RECORDING_EVENT = "start-recording";
    private static final String STOP_RECORDING_EVENT = "stop-recording";
        
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
    public void record(String room, String meetingid){
    	String RECORD_DIR = "/var/freeswitch/meetings";        
    	String voicePath = RECORD_DIR + File.separatorChar + meetingid + "-" + System.currentTimeMillis() + ".wav";
    	
    	if (log.isDebugEnabled())
    		log.debug("Asking Freeswitch to start recording in {}", voicePath);
    	
    	Client c = manager.getESLClient();
        if (c.canSend()) {
        	RecordConferenceCommand rcc = new RecordConferenceCommand(room, USER, true, voicePath);
        	log.debug(rcc.getCommand() + rcc.getCommandArgs());
        	EslMessage response = manager.getESLClient().sendSyncApiCommand(rcc.getCommand(), rcc.getCommandArgs());
            rcc.handleResponse(response, conferenceEventListener);       	
        }else {
        	log.warn("Can't send record request to FreeSWITCH as we are not connected.");
        	// Let's see if we can recover the connection.
        	startHeartbeatMonitor();
        }
    }

    @Override
    public void eventReceived(EslEvent event) {
        if(event.getEventName().equals(FreeswitchHeartbeatMonitor.EVENT_HEARTBEAT)) {
            setChanged();
            notifyObservers(event);
            return; //No need to log.debug or process further the Observer will act on this
        }
        //Ignored, Noop This is all the NON-Conference Events except Heartbeat
        log.debug( "eventReceived [{}]", event );

    }

    @Override
    public void conferenceEventJoin(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemberIdFromEvent(event);
        Map<String, String> headers = event.getEventHeaders();
        String callerId = this.getCallerIdFromEvent(event);
        String callerIdName = this.getCallerIdNameFromEvent(event);
        boolean muted = headers.get("Speak").equals("true") ? false : true; //Was inverted which was causing a State issue
        boolean speeking = headers.get("Talking").equals("true") ? true : false;

        ParticipantJoinedEvent pj = new ParticipantJoinedEvent(memberId, confName, callerId, callerIdName, muted, speeking);
        conferenceEventListener.handleConferenceEvent(pj);
    }

    @Override
    public void conferenceEventLeave(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemberIdFromEvent(event);
        ParticipantLeftEvent pl = new ParticipantLeftEvent(memberId, confName);
        conferenceEventListener.handleConferenceEvent(pl);
    }

    @Override
    public void conferenceEventMute(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemberIdFromEvent(event);
        ParticipantMutedEvent pm = new ParticipantMutedEvent(memberId, confName, true);
        conferenceEventListener.handleConferenceEvent(pm);
    }

    @Override
    public void conferenceEventUnMute(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemberIdFromEvent(event);
        ParticipantMutedEvent pm = new ParticipantMutedEvent(memberId, confName, false);
        conferenceEventListener.handleConferenceEvent(pm);
    }

    @Override
    public void conferenceEventAction(String uniqueId, String confName, int confSize, String action, EslEvent event) {
        Integer memberId = this.getMemberIdFromEvent(event);
        ParticipantTalkingEvent pt;

        if(action == null) {
            if(debug) {
                Map<String, String> eventHeaders = event.getEventHeaders();
                StringBuilder sb = new StringBuilder("\n");
                for (Iterator it=eventHeaders.entrySet().iterator(); it.hasNext(); ) {
                    Map.Entry entry = (Map.Entry)it.next();
                    sb.append(entry.getKey());
                    sb.append(" => '");
                    sb.append(entry.getValue());
                    sb.append("'\n");
                }
                log.debug ("NULL Conference Action [{}] Headers:\n{}\nEND", confName, sb.toString());
            }
            return;
        }

        if (action.equals(START_TALKING_EVENT)) {
            pt = new ParticipantTalkingEvent(memberId, confName, true);
            conferenceEventListener.handleConferenceEvent(pt);        	
        } else if (action.equals(STOP_TALKING_EVENT)) {
            pt = new ParticipantTalkingEvent(memberId, confName, false);
            conferenceEventListener.handleConferenceEvent(pt);        	
        } else {
        	log.debug("Unknown conference Action [{}]", action);
        }
    }

    @Override
    public void conferenceEventTransfer(String uniqueId, String confName, int confSize, EslEvent event) {
        //Ignored, Noop
    }

    @Override
    public void conferenceEventThreadRun(String uniqueId, String confName, int confSize, EslEvent event) {
    	
    }
    
    //@Override
    public void conferenceEventRecord(String uniqueId, String confName, int confSize, EslEvent event) {
    	String action = event.getEventHeaders().get("Action");
    	
        if(action == null) {
            if(debug) {
                Map<String, String> eventHeaders = event.getEventHeaders();
                StringBuilder sb = new StringBuilder("\n");
                for (Iterator it=eventHeaders.entrySet().iterator(); it.hasNext(); ) {
                    Map.Entry entry = (Map.Entry)it.next();
                    sb.append(entry.getKey());
                    sb.append(" => '");
                    sb.append(entry.getValue());
                    sb.append("'\n");
                }
                log.debug ("NULL Conference Action [{}] Headers:\n{}\nEND", confName, sb.toString());
            }
            return;
        }
        
    	if (log.isDebugEnabled())
    		log.debug("Handling conferenceEventRecord " + action);
    	
    	if (action.equals(START_RECORDING_EVENT)) {
            StartRecordingEvent sre = new StartRecordingEvent(123, confName, true);
            sre.setRecordingFilename(getRecordFilenameFromEvent(event));
            sre.setTimestamp(getRecordTimestampFromEvent(event));
            
            if (log.isDebugEnabled())
            	log.debug("Processing conference event - action: {} time: {} file: {}", new Object[] {action,  sre.getTimestamp(), sre.getRecordingFilename()});
            
            conferenceEventListener.handleConferenceEvent(sre);    		
    	} else if (action.equals(STOP_RECORDING_EVENT)) {
        	StartRecordingEvent srev = new StartRecordingEvent(123, confName, false);
            srev.setRecordingFilename(getRecordFilenameFromEvent(event));
            srev.setTimestamp(getRecordTimestampFromEvent(event));
            
            if (log.isDebugEnabled())
            	log.debug("Processing conference event - action: {} time: {} file: {}", new Object[] {action,  srev.getTimestamp(), srev.getRecordingFilename()});
            
            conferenceEventListener.handleConferenceEvent(srev);    		
    	} else {
        	if (log.isDebugEnabled())
        		log.warn("Processing UNKNOWN conference Action {}", action);
    	}
    }

    @Override
    public void conferenceEventPlayFile(String uniqueId, String confName, int confSize, EslEvent event) {
        //Ignored, Noop
    }

    @Override
    public void backgroundJobResultReceived(EslEvent event) {
        log.debug( "Background job result received [{}]", event );
    }

    @Override
    public void exceptionCaught(ExceptionEvent e) {
        setChanged();
        notifyObservers(e);
        //log.error( "FreeSwitch ESL Exception.", e );
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
    
    private Integer getMemberIdFromEvent(EslEvent e)
    {
        return new Integer(e.getEventHeaders().get("Member-ID"));
    }

    private String getCallerIdFromEvent(EslEvent e)
    {
        return e.getEventHeaders().get("Caller-Caller-ID-Number");
    }

    private String getCallerIdNameFromEvent(EslEvent e)
    {
        return e.getEventHeaders().get("Caller-Caller-ID-Name");
    }
    
    private String getRecordFilenameFromEvent(EslEvent e) {
    	return e.getEventHeaders().get("Path");
    }
    
    private String getRecordTimestampFromEvent(EslEvent e) {
    	return e.getEventHeaders().get("Event-Date-Timestamp");
    }
}