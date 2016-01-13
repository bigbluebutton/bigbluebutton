package org.bigbluebutton.freeswitch.voice.freeswitch;


import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.bigbluebutton.freeswitch.voice.events.DeskShareEndedEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareRecordingEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareStartedEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareViewerJoinedEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareViewerLeftEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareRTMPBroadcastEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceConferenceEvent;
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

    private static final String DESKSHARE_CONFERENCE_NAME_SUFFIX = "-DESKSHARE";
    private static final String DESKSHARE_CALLER_NAME_SUFFIX = " (Screen)";
    private static final String DESKSHARE_CALLER_ID_SUFFIX = " (screen)";

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

        // Deskstop sharing conferences have their name in the form 7dddd-DESKSHARE
        if (confName.endsWith(DESKSHARE_CONFERENCE_NAME_SUFFIX)) {
            // Deskstop sharing conferences have the user with the desktop video displayed in this way:
            // username (Screen) and usernum (screen)
            if (callerId.endsWith(DESKSHARE_CALLER_ID_SUFFIX) && callerIdName.endsWith(DESKSHARE_CALLER_NAME_SUFFIX)) {
                DeskShareStartedEvent dsStart = new DeskShareStartedEvent(confName, callerId, callerIdName);
                conferenceEventListener.handleConferenceEvent(dsStart);
            } else {
                DeskShareViewerJoinedEvent dsJoined = new DeskShareViewerJoinedEvent(confName, callerId, callerIdName);
                conferenceEventListener.handleConferenceEvent(dsJoined);
            }
        }

        Matcher matcher = CALLERNAME_PATTERN.matcher(callerIdName);
        if (matcher.matches()) {
            voiceUserId = matcher.group(1).trim();
            callerIdName = matcher.group(2).trim();
        }

        VoiceUserJoinedEvent pj = new VoiceUserJoinedEvent(voiceUserId, memberId.toString(), confName, callerId, callerIdName, muted, speaking);
        conferenceEventListener.handleConferenceEvent(pj);
    }

    @Override
    public void conferenceEventLeave(String uniqueId, String confName, int confSize, EslEvent event) {      
        Integer memberId = this.getMemberIdFromEvent(event);
        System.out.println("User left voice conference, user=[" + memberId.toString() + "], conf=[" + confName + "]");

        // Deskstop sharing conferences have their name in the form 7dddd-DESKSHARE
        if (confName.endsWith(DESKSHARE_CONFERENCE_NAME_SUFFIX)) {
            String callerId = this.getCallerIdFromEvent(event);
            String callerIdName = this.getCallerIdNameFromEvent(event);
            // Deskstop sharing conferences have the user with the desktop video displayed in this way:
            // username (Screen) and usernum (screen)
            if (callerId.endsWith(DESKSHARE_CALLER_ID_SUFFIX) && callerIdName.endsWith(DESKSHARE_CALLER_NAME_SUFFIX)) {
                DeskShareEndedEvent dsEnd = new DeskShareEndedEvent(confName, callerId, callerIdName);
                conferenceEventListener.handleConferenceEvent(dsEnd);
            } else {
                DeskShareViewerLeftEvent dsLeft = new DeskShareViewerLeftEvent(confName, callerId, callerIdName);
                conferenceEventListener.handleConferenceEvent(dsLeft);
            }
        }

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

        if (action.equals(START_RECORDING_EVENT)) {
            if (confName.endsWith(DESKSHARE_CONFERENCE_NAME_SUFFIX)){
                if (isRTMPStream(event)) {
                    DeskShareRTMPBroadcastEvent rtmp = new DeskShareRTMPBroadcastEvent(confName, true);
                    rtmp.setChannels(Integer.parseInt(getBroadcastParameter(event, "channels")));
                    rtmp.setFramesPerSecond(Double.parseDouble(getBroadcastParameter(event, "fps")));
                    rtmp.setVideoHeight(Integer.parseInt(getBroadcastParameter(event, "vh")));
                    rtmp.setVideoWidth(Integer.parseInt(getBroadcastParameter(event, "vw")));
                    rtmp.setSampleRate(Integer.parseInt(getBroadcastParameter(event, "samplerate")));
                    rtmp.setRecordingStreamUrl(getStreamUrl(event));
                    rtmp.setTimestamp(genTimestamp().toString());

                    System.out.println("DeskShare conference broadcast started. url=["
                            + getStreamUrl(event) + "], conf=[" + confName + "]");
                    conferenceEventListener.handleConferenceEvent( (VoiceConferenceEvent)rtmp);
                } else {
                    DeskShareRecordingEvent dssre = new DeskShareRecordingEvent(confName, true);
                    dssre.setRecordingFilename(getDeskShareRecordFilenameFromEvent(event));
                    dssre.setTimestamp(genTimestamp().toString());
                    dssre.setChannels(Integer.parseInt(getBroadcastParameter(event, "channels")));
                    dssre.setFramesPerSecond(Double.parseDouble(getBroadcastParameter(event, "fps")));
                    dssre.setVideoHeight(Integer.parseInt(getBroadcastParameter(event, "vh")));
                    dssre.setVideoWidth(Integer.parseInt(getBroadcastParameter(event, "vw")));
                    dssre.setSampleRate(Integer.parseInt(getBroadcastParameter(event, "samplerate")));

                    System.out.println("DeskShare conference recording started. file=["
                            + dssre.getRecordingFilename() + "], conf=[" + confName + "]");
                    conferenceEventListener.handleConferenceEvent( (VoiceConferenceEvent)dssre);
                }
            } else {
                VoiceStartRecordingEvent sre = new VoiceStartRecordingEvent(confName, true);
                sre.setRecordingFilename(getRecordFilenameFromEvent(event));
                sre.setTimestamp(genTimestamp().toString());

                System.out.println("Voice conference recording started. file=["
                 + getRecordFilenameFromEvent(event) + "], conf=[" + confName + "]");
                conferenceEventListener.handleConferenceEvent(sre);
            }
        } else if (action.equals(STOP_RECORDING_EVENT)) {
            if (confName.endsWith(DESKSHARE_CONFERENCE_NAME_SUFFIX)){
                if (isRTMPStream(event)) {
                    DeskShareRTMPBroadcastEvent rtmp = new DeskShareRTMPBroadcastEvent(confName, false);
                    rtmp.setChannels(Integer.parseInt(getBroadcastParameter(event, "channels")));
                    rtmp.setFramesPerSecond(Double.parseDouble(getBroadcastParameter(event, "fps")));
                    rtmp.setVideoHeight(Integer.parseInt(getBroadcastParameter(event, "vh")));
                    rtmp.setVideoWidth(Integer.parseInt(getBroadcastParameter(event, "vw")));
                    rtmp.setSampleRate(Integer.parseInt(getBroadcastParameter(event, "samplerate")));
                    rtmp.setRecordingStreamUrl(getStreamUrl(event));
                    rtmp.setTimestamp(genTimestamp().toString());

                    System.out.println("DeskShare conference broadcast stopped. url=["
                            + getStreamUrl(event) + "], conf=[" + confName + "]");
                    conferenceEventListener.handleConferenceEvent( (VoiceConferenceEvent)rtmp);
                } else {
                    DeskShareRecordingEvent dssre = new DeskShareRecordingEvent(confName, false);
                    dssre.setRecordingFilename(getDeskShareRecordFilenameFromEvent(event));
                    dssre.setTimestamp(genTimestamp().toString());
                    dssre.setChannels(Integer.parseInt(getBroadcastParameter(event, "channels")));
                    dssre.setFramesPerSecond(Double.parseDouble(getBroadcastParameter(event, "fps")));
                    dssre.setVideoHeight(Integer.parseInt(getBroadcastParameter(event, "vh")));
                    dssre.setVideoWidth(Integer.parseInt(getBroadcastParameter(event, "vw")));
                    dssre.setSampleRate(Integer.parseInt(getBroadcastParameter(event, "samplerate")));

                    System.out.println("DeskShare conference recording stopped. file=["
                     + dssre.getRecordingFilename() + "], conf=[" + confName + "]");
                    conferenceEventListener.handleConferenceEvent( (VoiceConferenceEvent)dssre);
                }
            } else {
                VoiceStartRecordingEvent sre = new VoiceStartRecordingEvent(confName, false);
                sre.setRecordingFilename(getRecordFilenameFromEvent(event));
                sre.setTimestamp(genTimestamp().toString());
                System.out.println("Voice conference recording stopped. file=["
                 + getRecordFilenameFromEvent(event) + "], conf=[" + confName + "]");
                conferenceEventListener.handleConferenceEvent(sre);
            }
        } 

        else {
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

    private String getDeskShareRecordFilenameFromEvent(EslEvent e) {
        String rawPath = e.getEventHeaders().get("Path");
        // System.out.println("raw=" + rawPath);
        String path = rawPath.substring(rawPath.lastIndexOf("}") + 1);
        // System.out.println("path="+path);
        return path;
    }

    // Distinguish between recording to a file:
    // /path/to/a/file.mp4
    // and broadcasting a stream:
    // {channels=2,samplerate=48000,vw=1920,vh=1080,fps=15.00}rtmp://192.168.0.109/live/abc/dev-test
    private Boolean isRTMPStream(EslEvent e) {
        String path = e.getEventHeaders().get("Path");

        if (path.contains("rtmp") && path.contains("channels")
                && path.contains("samplerate") && path.contains("vw")
                && path.contains("vh") && path.contains("fps")) {
            return true;
        } else {
            return false;
        }
    }

    // returns a String so that we can parse to an int or double depending on the param
    private String getBroadcastParameter(EslEvent e, String param) {
        String path = e.getEventHeaders().get("Path");
        if (isRTMPStream(e)){
            String temp = path.substring(path.indexOf("{") + 1, path.indexOf("}"));
            String[] arr = temp.split(",");
            for (int i =0; i<5; i++) {
                if (arr[i].startsWith(param)) {
                    return arr[i].substring(arr[i].indexOf('=')+1);
                }
            }
            return "0";
        } else {
            return "0";
        }
    }

    // Obtain the rtmp url from:
    // {channels=2,samplerate=48000,vw=1920,vh=1080,fps=15.00}rtmp://192.168.0.109/live/abc/dev-test
    private String getStreamUrl(EslEvent e) {
        String path = e.getEventHeaders().get("Path");
        if (isRTMPStream(e)){
            return path.substring(path.lastIndexOf("}") + 1);
        } else {
            return "";
        }
    }

}
