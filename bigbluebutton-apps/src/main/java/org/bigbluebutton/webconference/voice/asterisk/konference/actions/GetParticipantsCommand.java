package org.bigbluebutton.webconference.voice.asterisk.konference.actions;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.response.CommandResponse;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.konference.KonferenceEventHandler;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceJoinEvent;
import org.bigbluebutton.webconference.voice.commands.ConferenceCommandResult;

public class GetParticipantsCommand extends KonferenceCommand {
	private static final Pattern KONFERENCE_LIST_PATTERN = Pattern.compile("^MemberId:(.+)CIDName:(.+)CID:(.+)Audio:(.+)UniqueID:(.+)ConfName:(.+)Channel:(.+)$");
	
	public GetParticipantsCommand(String room, Integer requesterId) {
		super(room, requesterId);
		// TODO Auto-generated constructor stub
	}

	@Override
	public CommandAction getCommandAction() {
		return new CommandAction("konference list " + room);
	}

	@Override
	public void handleResponse(ManagerResponse response, KonferenceEventHandler eventHandler) {
		final List<String> lines;
		Matcher matcher;
		
        lines = ((CommandResponse) response).getResult();
        for (String line : lines) {
        	matcher = KONFERENCE_LIST_PATTERN.matcher(line);
            if (matcher.matches()) {
            	Integer memberId = Integer.valueOf(matcher.group(1).trim());
            	String callerIdName = matcher.group(2).trim();
            	String callerIdNum = matcher.group(3).trim();
            	boolean muted = "Unmuted".equals(matcher.group(4).trim()) ? true : false;
            	String conferenceName = matcher.group(6).trim();
            	
            	ConferenceJoinEvent cj = new ConferenceJoinEvent(memberId);
            	cj.setMember(memberId);
            	cj.setCallerID(callerIdNum);
            	cj.setCallerIDName(callerIdName);
            	cj.setConferenceName(conferenceName);
            	
            	eventHandler.handlKonferenceEvent(cj);
            }        	
        }
	}


}
