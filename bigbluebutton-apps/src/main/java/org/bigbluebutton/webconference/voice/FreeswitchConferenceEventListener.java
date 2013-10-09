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
package org.bigbluebutton.webconference.voice;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.bigbluebutton.webconference.voice.events.ConferenceEvent;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;
import org.bigbluebutton.webconference.voice.events.StartRecordingEvent;

public class FreeswitchConferenceEventListener implements ConferenceEventListener {
	private static final int SENDERTHREADS = 1;
	private static final Executor msgSenderExec = Executors.newFixedThreadPool(SENDERTHREADS);
	
	private BlockingQueue<ConferenceEvent> messages = new LinkedBlockingQueue<ConferenceEvent>();

    private volatile boolean sendMessages = false;
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW inGW) {
		bbbInGW = inGW;
	}
	
    private void queueMessage(ConferenceEvent event) {
    	try {
			messages.offer(event, 5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
	private void sendMessageToBigBlueButton(ConferenceEvent event) {
		if (event instanceof ParticipantJoinedEvent) {
			ParticipantJoinedEvent evt = (ParticipantJoinedEvent) event;
			bbbInGW.voiceUserJoined(evt.getParticipantId(), evt.getRoom(), 
					evt.getCallerIdNum(), evt.getCallerIdName(),
					evt.getMuted(), evt.getSpeaking());
		} else if (event instanceof ParticipantLeftEvent) {
			ParticipantLeftEvent evt = (ParticipantLeftEvent) event;
			bbbInGW.voiceUserLeft(evt.getParticipantId(), evt.getRoom());
		} else if (event instanceof ParticipantMutedEvent) {
			ParticipantMutedEvent evt = (ParticipantMutedEvent) event;
			bbbInGW.voiceUserMuted(evt.getParticipantId(), evt.getRoom(), evt.isMuted());
		} else if (event instanceof ParticipantTalkingEvent) {
			ParticipantTalkingEvent evt = (ParticipantTalkingEvent) event;
			bbbInGW.voiceUserTalking(evt.getParticipantId(), evt.getRoom(), evt.isTalking());
		} else if (event instanceof StartRecordingEvent) {
			StartRecordingEvent evt = (StartRecordingEvent) event;
			bbbInGW.voiceStartedRecording(evt.getRoom(), evt.getRecordingFilename(), evt.getTimestamp(), evt.startRecord());
		} 		
	}
	
	public void start() {
		sendMessages = true;
		Runnable sender = new Runnable() {
			public void run() {
				while (sendMessages) {
					ConferenceEvent message;
					try {
						message = messages.take();
						sendMessageToBigBlueButton(message);	
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}									
				}
			}
		};
		msgSenderExec.execute(sender);		
	}
	
	public void stop() {
		sendMessages = false;
	}
	
	public void handleConferenceEvent(ConferenceEvent event) {
		queueMessage(event);
	}
	
}
