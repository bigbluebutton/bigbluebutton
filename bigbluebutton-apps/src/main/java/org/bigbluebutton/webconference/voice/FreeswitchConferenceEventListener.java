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
import org.bigbluebutton.webconference.voice.events.VoiceConferenceEvent;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.events.VoiceUserJoinedEvent;
import org.bigbluebutton.webconference.voice.events.VoiceUserLeftEvent;
import org.bigbluebutton.webconference.voice.events.VoiceUserMutedEvent;
import org.bigbluebutton.webconference.voice.events.VoiceUserTalkingEvent;
import org.bigbluebutton.webconference.voice.events.VoiceStartRecordingEvent;

public class FreeswitchConferenceEventListener implements ConferenceEventListener {
	private static final int SENDERTHREADS = 1;
	private static final Executor msgSenderExec = Executors.newFixedThreadPool(SENDERTHREADS);
	
	private BlockingQueue<VoiceConferenceEvent> messages = new LinkedBlockingQueue<VoiceConferenceEvent>();

    private volatile boolean sendMessages = false;
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW inGW) {
		bbbInGW = inGW;
	}
	
    private void queueMessage(VoiceConferenceEvent event) {
    	try {
			messages.offer(event, 5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
	private void sendMessageToBigBlueButton(VoiceConferenceEvent event) {
		if (event instanceof VoiceUserJoinedEvent) {
			VoiceUserJoinedEvent evt = (VoiceUserJoinedEvent) event;
		//	bbbInGW.voiceUserJoined(evt.getUserId(), evt.getRoom(), 
		//			evt.getCallerIdNum(), evt.getCallerIdName(),
		//			evt.getMuted(), evt.getSpeaking());
		} else if (event instanceof VoiceUserLeftEvent) {
			VoiceUserLeftEvent evt = (VoiceUserLeftEvent) event;
		//	bbbInGW.voiceUserLeft(evt.getUserId(), evt.getRoom());
		} else if (event instanceof VoiceUserMutedEvent) {
			VoiceUserMutedEvent evt = (VoiceUserMutedEvent) event;
		//	bbbInGW.voiceUserMuted(evt.getUserId(), evt.getRoom(), evt.isMuted());
		} else if (event instanceof VoiceUserTalkingEvent) {
			VoiceUserTalkingEvent evt = (VoiceUserTalkingEvent) event;
		//	bbbInGW.voiceUserTalking(evt.getUserId(), evt.getRoom(), evt.isTalking());
		} else if (event instanceof VoiceStartRecordingEvent) {
			VoiceStartRecordingEvent evt = (VoiceStartRecordingEvent) event;
		//	bbbInGW.voiceStartedRecording(evt.getRoom(), evt.getRecordingFilename(), evt.getTimestamp(), evt.startRecord());
		} 		
	}
	
	public void start() {
		sendMessages = true;
		Runnable sender = new Runnable() {
			public void run() {
				while (sendMessages) {
					VoiceConferenceEvent message;
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
	
	public void handleConferenceEvent(VoiceConferenceEvent event) {
		queueMessage(event);
	}
	
}
