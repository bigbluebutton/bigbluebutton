package org.bigbluebutton.freeswitch.voice.freeswitch;


import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.google.gson.Gson;
import org.bigbluebutton.freeswitch.voice.events.*;
import org.freeswitch.esl.client.IEslEventListener;
import org.freeswitch.esl.client.transport.event.EslEvent;
import org.jboss.netty.channel.ExceptionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ESLEventListener implements IEslEventListener {
    private static Logger log = LoggerFactory.getLogger(ESLEventListener.class);

    private static final String START_TALKING_EVENT = "start-talking";
    private static final String STOP_TALKING_EVENT = "stop-talking";
    private static final String START_RECORDING_EVENT = "start-recording";
    private static final String STOP_RECORDING_EVENT = "stop-recording";
    private static final String CONFERENCE_CREATED_EVENT = "conference-create";
    private static final String CONFERENCE_DESTROYED_EVENT = "conference-destroy";
    private static final String FLOOR_CHANGE_EVENT = "video-floor-change";
    private static final String CHANNEL_CALLSTATE_EVENT = "CHANNEL_CALLSTATE";
    private static final String CHANNEL_CALLSTATE_HELD = "HELD";
    private static final String CHANNEL_CALLSTATE_ACTIVE = "ACTIVE";

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
        //System.out.println( "Background job result received [" + event + "]");
    }

    @Override
    public void exceptionCaught(ExceptionEvent e) {
        log.warn("Exception caught: ", e);
//        setChanged();
//        notifyObservers(e);
    }

    private static final Pattern GLOBAL_AUDION_PATTERN = Pattern.compile("(GLOBAL_AUDIO)_(.*)$");
    private static final Pattern CALLERNAME_PATTERN = Pattern.compile("(.*)-bbbID-(.*)$");
    private static final Pattern CALLERNAME_WITH_SESS_INFO_PATTERN = Pattern.compile("^(.*)_(\\d+)-bbbID-(.*)$");
    private static final Pattern CALLERNAME_LISTENONLY_PATTERN = Pattern.compile("^(.*)_(\\d+)-bbbID-LISTENONLY-(.*)$");
    private static final Pattern ECHO_TEST_DEST_PATTERN = Pattern.compile("^echo(\\d+)$");
    
    @Override
    public void conferenceEventJoin(String uniqueId, String confName, int confSize, EslEvent event) {

        Integer memberId = this.getMemberId(event);
        Map<String, String> headers = event.getEventHeaders();
        String callerId = this.getCallerId(event);
        String callerIdName = this.getCallerIdNameFromEvent(event);
        String channelCallState = this.getChannelCallState(headers);
        boolean muted = headers.get("Speak").equals("true") ? false : true; //Was inverted which was causing a State issue
        boolean speaking = headers.get("Talking").equals("true") ? true : false;
        boolean hold = channelCallState.equals(CHANNEL_CALLSTATE_HELD);

        String voiceUserId = callerIdName;

        Matcher gapMatcher = GLOBAL_AUDION_PATTERN.matcher(callerIdName);
        if (gapMatcher.matches()) {
            //System.out.println("Ignoring GLOBAL AUDIO USER [" + callerIdName + "]");
            return;
        }

        String coreuuid = headers.get("Core-UUID");
        String callState = "IN_CONFERENCE";
        String origCallerIdName = headers.get("Caller-Caller-ID-Name");
        String origCallerDestNumber = headers.get("Caller-Destination-Number");
        String clientSession = "0";
        String memberIdStr = memberId != null ? memberId.toString() : "";

        Matcher matcher = CALLERNAME_PATTERN.matcher(callerIdName);
        Matcher callWithSess = CALLERNAME_WITH_SESS_INFO_PATTERN.matcher(callerIdName);
        if (callWithSess.matches()) {
            voiceUserId = callWithSess.group(1).trim();
            clientSession = callWithSess.group(2).trim();
            callerIdName = callWithSess.group(3).trim();
        } else if (matcher.matches()) {
            voiceUserId = matcher.group(1).trim();
            callerIdName = matcher.group(2).trim();
        } else {
            // This is a caller using phone. Let's create a userId that will allow
            // us to identify the user as such in other parts of the system.
            // (ralam - sept 1, 2017)
            voiceUserId = "v_" + memberId.toString();
        }

        VoiceCallStateEvent csEvent = new VoiceCallStateEvent(
                confName,
                coreuuid,
                clientSession,
                voiceUserId,
                memberIdStr,
                callerIdName,
                callState,
                origCallerIdName,
                origCallerDestNumber);
        conferenceEventListener.handleConferenceEvent(csEvent);

        String callerUUID = this.getMemberUUIDFromEvent(event);
        log.info("Caller joined: conf=" + confName +
                ",uuid=" + callerUUID +
                ",memberId=" + memberId +
                ",callerId=" + callerId +
                ",callerIdName=" + callerIdName +
                ",muted=" + muted +
                ",talking=" + speaking);

        VoiceUserJoinedEvent pj = new VoiceUserJoinedEvent(
                voiceUserId,
                memberId.toString(),
                confName,
                callerId,
                callerIdName,
                muted,
                speaking,
                "none",
                hold,
                callerUUID);
        conferenceEventListener.handleConferenceEvent(pj);
    }

    @Override
    public void conferenceEventLeave(String uniqueId, String confName, int confSize, EslEvent event) {      
        Integer memberId = this.getMemberId(event);
        String callerId = this.getCallerId(event);
        String callerIdName = this.getCallerIdNameFromEvent(event);

        String callerUUID = this.getMemberUUIDFromEvent(event);
        log.info("Caller left: conf=" + confName +
                ",uuid=" + callerUUID +
                ",memberId=" + memberId +
                ",callerId=" + callerId +
                ",callerIdName=" + callerIdName);
        VoiceUserLeftEvent pl = new VoiceUserLeftEvent(memberId.toString(), confName);
        conferenceEventListener.handleConferenceEvent(pl);
    }

    @Override
    public void conferenceEventMute(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemberId(event);
        VoiceUserMutedEvent pm = new VoiceUserMutedEvent(memberId.toString(), confName, true);
        conferenceEventListener.handleConferenceEvent(pm);
    }

    @Override
    public void conferenceEventUnMute(String uniqueId, String confName, int confSize, EslEvent event) {
        Integer memberId = this.getMemberId(event);
        VoiceUserMutedEvent pm = new VoiceUserMutedEvent(memberId.toString(), confName, false);
        conferenceEventListener.handleConferenceEvent(pm);
    }

    @Override
    public void conferenceEventAction(String uniqueId, String confName, int confSize, String action, EslEvent event) {
        if (action == null) {
            return;
        }

        if (action.equals(START_TALKING_EVENT)) {
            Integer memberId = this.getMemberId(event);
            VoiceUserTalkingEvent pt = new VoiceUserTalkingEvent(memberId.toString(), confName, true);
            conferenceEventListener.handleConferenceEvent(pt);          
        } else if (action.equals(STOP_TALKING_EVENT)) {
            Integer memberId = this.getMemberId(event);
            VoiceUserTalkingEvent pt = new VoiceUserTalkingEvent(memberId.toString(), confName, false);
            conferenceEventListener.handleConferenceEvent(pt);          
        } else if (action.equals(CONFERENCE_CREATED_EVENT)) {
            VoiceConfRunningEvent pt = new VoiceConfRunningEvent(confName, true);
            conferenceEventListener.handleConferenceEvent(pt);
        } else if (action.equals(CONFERENCE_DESTROYED_EVENT)) {
            VoiceConfRunningEvent pt = new VoiceConfRunningEvent(confName, false);
            conferenceEventListener.handleConferenceEvent(pt);
        } else if (action.equals(FLOOR_CHANGE_EVENT)) {
            String holderMemberId = this.getNewFloorHolderMemberIdFromEvent(event);
            String oldHolderMemberId = this.getOldFloorHolderMemberIdFromEvent(event);
            String floorTimestamp = event.getEventHeaders().get("Event-Date-Timestamp");
            AudioFloorChangedEvent vFloor= new AudioFloorChangedEvent(confName, holderMemberId, oldHolderMemberId, floorTimestamp);
            conferenceEventListener.handleConferenceEvent(vFloor);
        } else {
            log.warn("Unknown conference Action [" + action + "]");
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
            VoiceStartRecordingEvent sre = new VoiceStartRecordingEvent(confName, true);
            sre.setRecordingFilename(getRecordFilenameFromEvent(event));
            sre.setTimestamp(genTimestamp().toString());

            conferenceEventListener.handleConferenceEvent(sre);
        } else if (action.equals(STOP_RECORDING_EVENT)) {
            VoiceStartRecordingEvent sre = new VoiceStartRecordingEvent(confName, false);
            sre.setRecordingFilename(getRecordFilenameFromEvent(event));
            sre.setTimestamp(genTimestamp().toString());
            conferenceEventListener.handleConferenceEvent(sre);
        } 

        else {
            log.warn("Processing UNKNOWN conference Action " + action + "]");
        }
    }

    private Long genTimestamp() {
        return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
    }
    
    @Override
    public void eventReceived(EslEvent event) {
//        System.out.println("*********** ESL Event Listener received event=[" + event.getEventName() + "]" +
//                event.getEventHeaders().toString());

        /**
        Map<String, String> eventHeaders1 = event.getEventHeaders();
         StringBuilder sb = new StringBuilder("");
         sb.append("\n");
         for (Iterator it = eventHeaders1.entrySet().iterator(); it.hasNext(); ) {
         Map.Entry entry = (Map.Entry)it.next();
         sb.append(entry.getKey());
         sb.append(" => '");
         sb.append(entry.getValue());
         sb.append("'\n");
         }

         System.out.println("##### ===>>> " + sb.toString());
         System.out.println("<<<=== #####");
        **/

        if (event.getEventName().equals("HEARTBEAT")) {
            Gson gson = new Gson();
            String json = gson.toJson(event.getEventHeaders());
            //log.info(json);

            log.info("Received Heartbeat from Freeswitch.");
            Map<String, String> headers = event.getEventHeaders();

            Map<String, String> hb = new HashMap<String, String>();
            hb.put("timestamp", headers.get("Event-Date-Timestamp"));
            hb.put("version", headers.get("FreeSWITCH-Version"));
            hb.put("uptime", headers.get("Up-Time"));

            FreeswitchHeartbeatEvent hbeatEvent = new FreeswitchHeartbeatEvent(hb);
            conferenceEventListener.handleConferenceEvent(hbeatEvent);

        } else if (event.getEventName().equals( "CHANNEL_EXECUTE" )) {
            Map<String, String> eventHeaders = event.getEventHeaders();

            String application = (eventHeaders.get("Application") == null) ? "" : eventHeaders.get("Application");
            String channelCallState = (eventHeaders.get("Channel-Call-State") == null) ? "" : eventHeaders.get("Channel-Call-State");
            String varvBridge = (eventHeaders.get("variable_vbridge") == null) ? "" : eventHeaders.get("variable_vbridge");

            if ("echo".equalsIgnoreCase(application) && !varvBridge.isEmpty()) {
                Integer memberId = this.getMemberId(eventHeaders);
                String origCallerIdName = eventHeaders.get("Caller-Caller-ID-Name");
                String origCallerDestNumber = eventHeaders.get("Caller-Destination-Number");
                String coreuuid = eventHeaders.get("Core-UUID");

                //System.out.println("******** uuid=" + coreuuid + " " + origCallerIdName + " is in echo test " + origCallerDestNumber + " vbridge=" + varvBridge);

                String voiceUserId = "";
                String callerName = origCallerIdName;
                String clientSession = "0";
                String callState = "IN_ECHO_TEST";
                String memberIdStr = memberId != null ? memberId.toString() : "";

                Matcher callerListenOnly = CALLERNAME_LISTENONLY_PATTERN.matcher(origCallerIdName);
                Matcher callWithSess = CALLERNAME_WITH_SESS_INFO_PATTERN.matcher(origCallerIdName);
                if (callWithSess.matches()) {
                    voiceUserId = callWithSess.group(1).trim();
                    clientSession = callWithSess.group(2).trim();
                    callerName = callWithSess.group(3).trim();
                } else if (callerListenOnly.matches()) {
                    voiceUserId = callerListenOnly.group(1).trim();
                    clientSession = callWithSess.group(2).trim();
                    callerName = callerListenOnly.group(3).trim();
                }

                String conf = origCallerDestNumber;
                Matcher callerDestNumberMatcher = ECHO_TEST_DEST_PATTERN.matcher(origCallerDestNumber);
                if (callerDestNumberMatcher.matches()) {
                    conf = callerDestNumberMatcher.group(1).trim();
                }

                VoiceCallStateEvent csEvent = new VoiceCallStateEvent(conf,
                        coreuuid,
                        clientSession,
                        voiceUserId,
                        memberIdStr,
                        callerName,
                        callState,
                        origCallerIdName,
                        origCallerDestNumber);
                conferenceEventListener.handleConferenceEvent(csEvent);

            } else if ("RINGING".equalsIgnoreCase(channelCallState) && !varvBridge.isEmpty()) {
                Integer memberId = this.getMemberId(eventHeaders);
                String origCallerIdName = eventHeaders.get("Caller-Caller-ID-Name");
                String origCallerDestNumber = eventHeaders.get("Caller-Destination-Number");
                String coreuuid = eventHeaders.get("Core-UUID");
                //System.out.println("******** uuid=" + coreuuid + " " + origCallerIdName + " is in ringing " + origCallerDestNumber + " vbridge=" + varvBridge);

                String voiceUserId = "";
                String callerName = origCallerIdName;
                String clientSession = "0";
                String callState = "CALL_STARTED";
                String memberIdStr = memberId != null ? memberId.toString() : "";

                Matcher callerListenOnly = CALLERNAME_LISTENONLY_PATTERN.matcher(origCallerIdName);
                Matcher callWithSess = CALLERNAME_WITH_SESS_INFO_PATTERN.matcher(origCallerIdName);
                if (callWithSess.matches()) {
                    voiceUserId = callWithSess.group(1).trim();
                    clientSession = callWithSess.group(2).trim();
                    callerName = callWithSess.group(3).trim();
                } else if (callerListenOnly.matches()) {
                    voiceUserId = callerListenOnly.group(1).trim();
                    clientSession = callWithSess.group(2).trim();
                    callerName = callerListenOnly.group(3).trim();
                }

                String conf = origCallerDestNumber;
                Matcher callerDestNumberMatcher = ECHO_TEST_DEST_PATTERN.matcher(origCallerDestNumber);
                if (callerDestNumberMatcher.matches()) {
                    conf = callerDestNumberMatcher.group(1).trim();
                }

                VoiceCallStateEvent csEvent = new VoiceCallStateEvent(conf,
                        coreuuid,
                        clientSession,
                        voiceUserId,
                        memberIdStr,
                        callerName,
                        callState,
                        origCallerIdName,
                        origCallerDestNumber);
                conferenceEventListener.handleConferenceEvent(csEvent);
            }
        } else if (event.getEventName().equalsIgnoreCase("CHANNEL_STATE")) {
            Map<String, String> eventHeaders = event.getEventHeaders();
            String channelCallState = (eventHeaders.get("Channel-Call-State") == null) ? "" : eventHeaders.get("Channel-Call-State");
            String channelState = (eventHeaders.get("Channel-State") == null) ? "" : eventHeaders.get("Channel-State");

            if ("HANGUP".equalsIgnoreCase(channelCallState) && "CS_DESTROY".equalsIgnoreCase(channelState)) {
                Integer memberId = this.getMemberId(eventHeaders);
                String origCallerIdName = eventHeaders.get("Caller-Caller-ID-Name");
                String origCallerDestNumber = eventHeaders.get("Caller-Destination-Number");
                String coreuuid = eventHeaders.get("Core-UUID");
                //System.out.println("******** uuid=" + coreuuid + " " + origCallerIdName + " is hanging up " + origCallerDestNumber);

                String voiceUserId = "";
                String callerName = origCallerIdName;
                String clientSession = "0";
                String callState = "CALL_ENDED";
                String memberIdStr = memberId != null ? memberId.toString() : "";

                Matcher callerListenOnly = CALLERNAME_LISTENONLY_PATTERN.matcher(origCallerIdName);
                Matcher callWithSess = CALLERNAME_WITH_SESS_INFO_PATTERN.matcher(origCallerIdName);
                if (callWithSess.matches()) {
                    voiceUserId = callWithSess.group(1).trim();
                    clientSession = callWithSess.group(2).trim();
                    callerName = callWithSess.group(3).trim();
                } else if (callerListenOnly.matches()) {
                    voiceUserId = callerListenOnly.group(1).trim();
                    clientSession = callWithSess.group(2).trim();
                    callerName = callerListenOnly.group(3).trim();
                }

                String conf = origCallerDestNumber;
                Matcher callerDestNumberMatcher = ECHO_TEST_DEST_PATTERN.matcher(origCallerDestNumber);
                if (callerDestNumberMatcher.matches()) {
                    conf = callerDestNumberMatcher.group(1).trim();
                }

                VoiceCallStateEvent csEvent = new VoiceCallStateEvent(conf,
                        coreuuid,
                        clientSession,
                        voiceUserId,
                        memberIdStr,
                        callerName,
                        callState,
                        origCallerIdName,
                        origCallerDestNumber
                        );
                conferenceEventListener.handleConferenceEvent(csEvent);

            } else if ("RINGING".equalsIgnoreCase(channelCallState) && "CS_EXECUTE".equalsIgnoreCase(channelState)) {
                Integer memberId = this.getMemberId(eventHeaders);
                String origCallerIdName = eventHeaders.get("Caller-Caller-ID-Name");
                String origCallerDestNumber = eventHeaders.get("Caller-Destination-Number");
                String coreuuid = eventHeaders.get("Core-UUID");
                //System.out.println("******** uuid=" + coreuuid + " " + origCallerIdName + " is ringing " + origCallerDestNumber);

                String voiceUserId = "";
                String callerName = origCallerIdName;
                String clientSession = "0";
                String callState = "CALL_STARTED";
                String memberIdStr = memberId != null ? memberId.toString() : "";

                Matcher callerListenOnly = CALLERNAME_LISTENONLY_PATTERN.matcher(origCallerIdName);
                Matcher callWithSess = CALLERNAME_WITH_SESS_INFO_PATTERN.matcher(origCallerIdName);
                if (callWithSess.matches()) {
                    voiceUserId = callWithSess.group(1).trim();
                    clientSession = callWithSess.group(2).trim();
                    callerName = callWithSess.group(3).trim();
                } else if (callerListenOnly.matches()) {
                    voiceUserId = callerListenOnly.group(1).trim();
                    clientSession = callWithSess.group(2).trim();
                    callerName = callerListenOnly.group(3).trim();
                }

                String conf = origCallerDestNumber;
                Matcher callerDestNumberMatcher = ECHO_TEST_DEST_PATTERN.matcher(origCallerDestNumber);
                if (callerDestNumberMatcher.matches()) {
                    conf = callerDestNumberMatcher.group(1).trim();
                }

                VoiceCallStateEvent csEvent = new VoiceCallStateEvent(conf,
                        coreuuid,
                        clientSession,
                        voiceUserId,
                        memberIdStr,
                        callerName,
                        callState,
                        origCallerIdName,
                        origCallerDestNumber
                        );
                conferenceEventListener.handleConferenceEvent(csEvent);
            }
        } else if (event.getEventName().equals(CHANNEL_CALLSTATE_EVENT)) {
            Map<String, String> eventHeaders = event.getEventHeaders();
            String channelCallState = this.getChannelCallState(eventHeaders);
            String originalChannelCallState = eventHeaders.get("Original-Channel-Call-State");
            if (channelCallState == null
                    || originalChannelCallState == null
                    || channelCallState.equals(originalChannelCallState)
                    || !(channelCallState.equals(CHANNEL_CALLSTATE_HELD) || channelCallState.equals(CHANNEL_CALLSTATE_ACTIVE))) {
                // No call state info, or no change in call state, or not a call state we care about
                return;
            }

            String intId = this.getIntId(event);

            if (intId == null) {
                return;
            }

            Boolean hold = channelCallState.equals(CHANNEL_CALLSTATE_HELD);
            String uuid = this.getMemberUUIDFromEvent(event);
            String conference = eventHeaders.get("Caller-Destination-Number");
            Matcher callerDestNumberMatcher = ECHO_TEST_DEST_PATTERN.matcher(conference);

            if (callerDestNumberMatcher.matches()) {
                    conference = callerDestNumberMatcher.group(1).trim();
            }

            ChannelHoldChangedEvent csEvent = new ChannelHoldChangedEvent(
                    conference,
                    intId,
                    uuid,
                    hold
            );
            conferenceEventListener.handleConferenceEvent(csEvent);
        }

    }

    private String getIntId(EslEvent event) {
        return this.getIntId(event.getEventHeaders());
    }

    private String getIntId(Map<String, String> eventHeaders) {
        String origCallerIdName = this.getCallerId(eventHeaders);
        Integer memberId = this.getMemberId(eventHeaders);
        Matcher callerListenOnly = CALLERNAME_LISTENONLY_PATTERN.matcher(origCallerIdName);
        Matcher callWithSess = CALLERNAME_WITH_SESS_INFO_PATTERN.matcher(origCallerIdName);
        if (callWithSess.matches()) {
            return callWithSess.group(1).trim();
        } else if (callerListenOnly.matches()) {
            return callerListenOnly.group(1).trim();
        } else if (memberId != null) {
            return "v_" + memberId.toString();
        } else {
            return null;
        }
    }

    private Integer getMemberId(EslEvent event) {
        return this.getMemberId(event.getEventHeaders());
    }

    private Integer getMemberId(Map<String, String> eventHeaders) {
        String memberId = eventHeaders.get("Member-ID");

        if (memberId == null) {
            return null;
        }

        return Integer.valueOf(memberId);
    }

    private String getCallerId(EslEvent event) {
        return this.getCallerId(event.getEventHeaders());
    }

    private String getCallerId(Map<String, String> eventHeaders) {
        return eventHeaders.get("Caller-Caller-ID-Number");
    }

    private String getChannelCallState(EslEvent event) {
        return this.getChannelCallState(event.getEventHeaders());
    }

    private String getChannelCallState(Map<String, String> eventHeaders) {
        return eventHeaders.get("Channel-Call-State");
    }

    private String getMemberUUIDFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Caller-Unique-ID");
    }

    private String getCallerChannelCreateTimeFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Caller-Channel-Created-Time");
    }

    private String getCallerChannelHangupTimeFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Caller-Channel-Hangup-Time");
    }


    private String getCallerIdNameFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Caller-Caller-ID-Name");
    }

    private String getRecordFilenameFromEvent(EslEvent e) {
        return e.getEventHeaders().get("Path");
    }

    private String getOldFloorHolderMemberIdFromEvent(EslEvent e) {
        String oldFloorHolder = e.getEventHeaders().get("Old-ID");
        if(oldFloorHolder == null || oldFloorHolder.equalsIgnoreCase("none")) {
            oldFloorHolder= "";
        }
        return oldFloorHolder;
    }

    private String getNewFloorHolderMemberIdFromEvent(EslEvent e) {
        String newHolder = e.getEventHeaders().get("New-ID");
        if(newHolder == null || newHolder.equalsIgnoreCase("none")) {
            newHolder = "";
        }
        return newHolder;
    }
}
