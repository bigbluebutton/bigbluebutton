package org.bigbluebutton.freeswitch.voice.freeswitch;


import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.bigbluebutton.freeswitch.voice.events.VoiceStartRecordingEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserJoinedEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserLeftEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserMutedEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserTalkingEvent;
import org.freeswitch.esl.client.IEslEventListener;
import org.freeswitch.esl.client.transport.event.EslEvent;
import org.jboss.netty.channel.ExceptionEvent;

public class ESLEventListener implements IEslEventListener {

    private static final String START_TALKING_EVENT = "start-talking";
    private static final String STOP_TALKING_EVENT = "stop-talking";
    private static final String START_RECORDING_EVENT = "start-recording";
    private static final String STOP_RECORDING_EVENT = "stop-recording";
    
    private final ConferenceEventListener conferenceEventListener;
    
    public ESLEventListener(ConferenceEventListener conferenceEventListener) {
    	this.conferenceEventListener = conferenceEventListener;
    }
    
    @Override
    public void conferenceEventPlayFile(String uniqueId, String confName, int confSize, EslEvent event) {
        //Ignored, Noop
    }

    @Override
    public void backgroundJobResultReceived(EslEvent event) {
        System.out.println( "Background job result received [" + event + "]");
    }

    @Override
    public void exceptionCaught(ExceptionEvent e) {
//        setChanged();
//        notifyObservers(e);
    }

    private static final Pattern GLOBAL_AUDION_PATTERN = Pattern.compile("(GLOBAL_AUDIO)_(.*)$");
    private static final Pattern CALLERNAME_PATTERN = Pattern.compile("(.*)-bbbID-(.*)$");
    
    @Override
    public void conferenceEventJoin(String uniqueId, String confName, int confSize, EslEvent event) {
    	
        Integer memberId = this.getMemberIdFromEvent(event);
        Map<String, String> headers = event.getEventHeaders();
        String callerId = this.getCallerIdFromEvent(event);
        String callerIdName = this.getCallerIdNameFromEvent(event);
        boolean muted = headers.get("Speak").equals("true") ? false : true; //Was inverted which was causing a State issue
        boolean speaking = headers.get("Talking").equals("true") ? true : false;

        String voiceUserId = callerIdName;
        
        System.out.println("User joined voice conference, user=[" + callerIdName + "], conf=[" + confName + "]");
        
        Matcher gapMatcher = GLOBAL_AUDION_PATTERN.matcher(callerIdName);
        if (gapMatcher.matches()) {
        	System.out.println("Ignoring GLOBAL AUDIO USER [" + callerIdName + "]");
        	return;
        }
        		
		    Matcher matcher = CALLERNAME_PATTERN.matcher(callerIdName);
		    if (matcher.matches()) {			
			    voiceUserId = matcher.group(1).trim();
			    callerIdName = matcher.group(2).trim();
		    } 
        
        VoiceUserJoinedEvent pj = new VoiceUserJoinedEvent(voiceUserId, memberId.toString(), confName, callerId, callerIdName, muted, speaking, null);
        conferenceEventListener.handleConferenceEvent(pj);
    }

    @Override
    public void conferenceEventLeave(String uniqueId, String confName, int confSize, EslEvent event) {   	
        Integer memberId = this.getMemberIdFromEvent(event);
        System.out.println("User left voice conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");
        VoiceUserLeftEvent pl = new VoiceUserLeftEvent(memberId.toString(), confName);
        conferenceEventListener.handleConferenceEvent(pl);
    }

    @Override
    public void conferenceEventMute(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemberIdFromEvent(event);
        System.out.println("******************** Received Conference Muted Event from FreeSWITCH user[" + memberId.toString() + "]");
        System.out.println("User muted voice conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");
        VoiceUserMutedEvent pm = new VoiceUserMutedEvent(memberId.toString(), confName, true);
        conferenceEventListener.handleConferenceEvent(pm);
    }

    @Override
    public void conferenceEventUnMute(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemberIdFromEvent(event);
        System.out.println("******************** Received ConferenceUnmuted Event from FreeSWITCH user[" + memberId.toString() + "]");
        System.out.println("User unmuted voice conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");
        VoiceUserMutedEvent pm = new VoiceUserMutedEvent(memberId.toString(), confName, false);
        conferenceEventListener.handleConferenceEvent(pm);
    }

    @Override
    public void conferenceEventAction(String uniqueId, String confName, int confSize, String action, EslEvent event) {
        Integer memberId = this.getMemberIdFromEvent(event);
        VoiceUserTalkingEvent pt;
        
        System.out.println("******************** Receive conference Action [" + action + "]");
        
        if (action == null) {
            return;
        }

        if (action.equals(START_TALKING_EVENT)) {
            pt = new VoiceUserTalkingEvent(memberId.toString(), confName, true);
            conferenceEventListener.handleConferenceEvent(pt);        	
        } else if (action.equals(STOP_TALKING_EVENT)) {
            pt = new VoiceUserTalkingEvent(memberId.toString(), confName, false);
            conferenceEventListener.handleConferenceEvent(pt);        	
        } else {
        	System.out.println("Unknown conference Action [" + action + "]");
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
            return;
        }
        
    	System.out.println("Handling conferenceEventRecord " + action);
    	
    	if (action.equals(START_RECORDING_EVENT)) {
            VoiceStartRecordingEvent sre = new VoiceStartRecordingEvent(confName, true);
            sre.setRecordingFilename(getRecordFilenameFromEvent(event));
            sre.setTimestamp(genTimestamp().toString());
            
            System.out.println("Voice conference recording started. file=[" + getRecordFilenameFromEvent(event) + "], conf=[" + confName + "]");
            
            conferenceEventListener.handleConferenceEvent(sre);    		
    	} else if (action.equals(STOP_RECORDING_EVENT)) {
        	VoiceStartRecordingEvent srev = new VoiceStartRecordingEvent(confName, false);
            srev.setRecordingFilename(getRecordFilenameFromEvent(event));
            srev.setTimestamp(genTimestamp().toString());
            
            System.out.println("Voice conference recording stopped. file=[" + getRecordFilenameFromEvent(event) + "], conf=[" + confName + "]");           
            conferenceEventListener.handleConferenceEvent(srev);    		
    	} else {
    		System.out.println("Processing UNKNOWN conference Action " + action + "]");
    	}
    }

    private Long genTimestamp() {
    	return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
    }
    
	@Override
	public void eventReceived(EslEvent event) {
		System.out.println("ESL Event Listener received event=[" + event.getEventName() + "]");
//        if (event.getEventName().equals(FreeswitchHeartbeatMonitor.EVENT_HEARTBEAT)) {
////           setChanged();
//           notifyObservers(event);
//           return; 
//        }
	}

    private Integer getMemberIdFromEvent(EslEvent e) {
        return new Integer(e.getEventHeaders().get("Member-ID"));
    }

    private String getCallerIdFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Caller-Caller-ID-Number");
    }

    private String getCallerIdNameFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Caller-Caller-ID-Name");
    }
    
    private String getRecordFilenameFromEvent(EslEvent e) {
    	return e.getEventHeaders().get("Path");
    }
}
