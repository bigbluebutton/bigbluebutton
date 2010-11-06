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
import org.bigbluebutton.webconference.voice.freeswitch.actions.EjectParticipantCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.PopulateRoomCommand;
import org.bigbluebutton.webconference.voice.freeswitch.actions.MuteParticipantCommand;
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

    private static final Map<String, Integer> ESL_EVENT_ACTIONS_MAP = createMap();
    private static final int ESL_ACTION_START_TALKING = 1;
    private static final int ESL_ACTION_STOP_TALKING = 2;
    
    private static Map<String, Integer> createMap() {
        Map<String,Integer> result = new HashMap<String,Integer>();
        result.put("start-talking", ESL_ACTION_START_TALKING);
        result.put("stop-talking", ESL_ACTION_STOP_TALKING);
        return Collections.unmodifiableMap(result);
    }
    
    @Override
    public void startup() {

        Client c = manager.getESLClient();
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
        }


        //Start Heartbeat and exception Event Observer Monitor
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
        PopulateRoomCommand prc = new PopulateRoomCommand(room, USER);
        EslMessage response = manager.getESLClient().sendSyncApiCommand(prc.getCommand(), prc.getCommandArgs());
        prc.handleResponse(response, conferenceEventListener);
    }

    @Override
    public void mute(String room, Integer participant, Boolean mute) {
        MuteParticipantCommand mpc = new MuteParticipantCommand(room, participant, mute, USER);
        String jobId = manager.getESLClient().sendAsyncApiCommand( mpc.getCommand(), mpc.getCommandArgs());
        log.debug("mute called for room [{}] jobid [{}]", room, jobId);
    }

    @Override
    public void eject(String room, Integer participant) {
        EjectParticipantCommand mpc = new EjectParticipantCommand(room, participant, USER);
        String jobId = manager.getESLClient().sendAsyncApiCommand( mpc.getCommand(), mpc.getCommandArgs());
        log.debug("eject/kick called for room [{}] jobid [{}]", room, jobId);
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
        Integer memberId = this.getMemeberIdFromEvent(event);
        Map<String, String> headers = event.getEventHeaders();
        String callerId = this.getCallerIdFromEvent(event);
        String callerIdName = this.getCallerIdNameFromEvent(event);
        boolean muted = headers.get("Speak").equals("true") ? false : true; //Was inverted which was causing a State issue
        boolean speeking = headers.get("Talking").equals("true") ? true : false;

        ParticipantJoinedEvent pj = new ParticipantJoinedEvent(memberId, confName,
                        callerId, callerIdName, muted, speeking);
        conferenceEventListener.handleConferenceEvent(pj);
    }

    @Override
    public void conferenceEventLeave(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemeberIdFromEvent(event);
        ParticipantLeftEvent pl = new ParticipantLeftEvent(memberId, confName);
        conferenceEventListener.handleConferenceEvent(pl);
    }

    @Override
    public void conferenceEventMute(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemeberIdFromEvent(event);
        ParticipantMutedEvent pm = new ParticipantMutedEvent(memberId, confName, true);
        conferenceEventListener.handleConferenceEvent(pm);
    }

    @Override
    public void conferenceEventUnMute(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemeberIdFromEvent(event);
        ParticipantMutedEvent pm = new ParticipantMutedEvent(memberId, confName, false);
        conferenceEventListener.handleConferenceEvent(pm);
    }

    @Override
    public void conferenceEventAction(String uniqueId, String confName, int confSize, String action, EslEvent event) {
        Integer memberId = this.getMemeberIdFromEvent(event);
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

        try {
            switch(ESL_EVENT_ACTIONS_MAP.get(action)) {
                case ESL_ACTION_START_TALKING:
                    pt = new ParticipantTalkingEvent(memberId, confName, true);
                    conferenceEventListener.handleConferenceEvent(pt);
                    break;
                case ESL_ACTION_STOP_TALKING:
                    pt = new ParticipantTalkingEvent(memberId, confName, false);
                    conferenceEventListener.handleConferenceEvent(pt);
                    break;
                default:
                    log.debug("Unknown conference Action [{}]", action);
            }
        }catch(NullPointerException npe) {
            log.debug("Unknown NPE conference Action [{}]", action);
        }
    }

    @Override
    public void conferenceEventTransfer(String uniqueId, String confName, int confSize, EslEvent event) {
        //Ignored, Noop
    }

    @Override
    public void conferenceEventThreadRun(String uniqueId, String confName, int confSize, EslEvent event) {
        //Ignored, Noop
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
    
    private Integer getMemeberIdFromEvent(EslEvent e)
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
}