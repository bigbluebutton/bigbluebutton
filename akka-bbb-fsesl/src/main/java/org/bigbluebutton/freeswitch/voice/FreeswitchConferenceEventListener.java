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
package org.bigbluebutton.freeswitch.voice;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.bigbluebutton.freeswitch.voice.events.DeskShareRecordingEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareStartedEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareEndedEvent;
import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.bigbluebutton.freeswitch.voice.events.DeskShareViewerJoinedEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareViewerLeftEvent;
import org.bigbluebutton.freeswitch.voice.events.DeskShareRTMPBroadcastEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceConferenceEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceStartRecordingEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserJoinedEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserLeftEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserMutedEvent;
import org.bigbluebutton.freeswitch.voice.events.VoiceUserTalkingEvent;

public class FreeswitchConferenceEventListener implements ConferenceEventListener {
	private static final int SENDERTHREADS = 1;
	private static final Executor msgSenderExec = Executors.newFixedThreadPool(SENDERTHREADS);
	private static final Executor runExec = Executors.newFixedThreadPool(SENDERTHREADS);
	private BlockingQueue<VoiceConferenceEvent> messages = new LinkedBlockingQueue<VoiceConferenceEvent>();

	private volatile boolean sendMessages = false;
	private final IVoiceConferenceService vcs;
	
	public FreeswitchConferenceEventListener(IVoiceConferenceService vcs) {
		this.vcs = vcs;
	}
	
    private void queueMessage(VoiceConferenceEvent event) {
    	try {
			messages.offer(event, 5, TimeUnit.SECONDS);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    			
	private void sendMessageToBigBlueButton(final VoiceConferenceEvent event) {
		Runnable task = new Runnable() {
			public void run() {
				if (event instanceof VoiceUserJoinedEvent) {
				System.out.println("************** FreeswitchConferenceEventListener received voiceUserJoined ");
				VoiceUserJoinedEvent evt = (VoiceUserJoinedEvent) event;
				vcs.userJoinedVoiceConf(evt.getRoom(), evt.getVoiceUserId(), evt.getUserId(), evt.getCallerIdName(), 
						evt.getCallerIdNum(), evt.getMuted(), evt.getSpeaking());
				} else if (event instanceof VoiceUserLeftEvent) {
					System.out.println("************** FreeswitchConferenceEventListener received VoiceUserLeftEvent ");
					VoiceUserLeftEvent evt = (VoiceUserLeftEvent) event;
					vcs.userLeftVoiceConf(evt.getRoom(), evt.getUserId());
				} else if (event instanceof VoiceUserMutedEvent) {
					System.out.println("************** FreeswitchConferenceEventListener VoiceUserMutedEvent ");
					VoiceUserMutedEvent evt = (VoiceUserMutedEvent) event;
					vcs.userMutedInVoiceConf(evt.getRoom(), evt.getUserId(), evt.isMuted());
				} else if (event instanceof VoiceUserTalkingEvent) {
					System.out.println("************** FreeswitchConferenceEventListener VoiceUserTalkingEvent ");
					VoiceUserTalkingEvent evt = (VoiceUserTalkingEvent) event;
					vcs.userTalkingInVoiceConf(evt.getRoom(), evt.getUserId(), evt.isTalking());
				} else if (event instanceof VoiceStartRecordingEvent) {
					VoiceStartRecordingEvent evt = (VoiceStartRecordingEvent) event;
					System.out.println("************** FreeswitchConferenceEventListener VoiceStartRecordingEvent recording=[" + evt.startRecord() + "]");
					vcs.voiceConfRecordingStarted(evt.getRoom(), evt.getRecordingFilename(), evt.startRecord(), evt.getTimestamp());
				} else if (event instanceof DeskShareStartedEvent) {
					System.out.println("********START******\n\n\n\n\n\n\n FreeswitchConferenceEventListener ");
					DeskShareStartedEvent evt = (DeskShareStartedEvent) event;
					System.out.println("************** FreeswitchConferenceEventListener DeskShareStartedEvent");
					vcs.deskShareStarted(evt.getRoom(), evt.getCallerIdNum(), evt.getCallerIdName());
				} else if (event instanceof DeskShareEndedEvent) {
					System.out.println("********END******\n\n\n\n\n FreeswitchConferenceEventListener ");
					DeskShareEndedEvent evt = (DeskShareEndedEvent) event;
					System.out.println("************** FreeswitchConferenceEventListener DeskShareEndedEvent");
					vcs.deskShareEnded(evt.getRoom(), evt.getCallerIdNum(), evt.getCallerIdName());
//				} else if (event instanceof DeskShareViewerJoinedEvent) {
////					System.out.println("********VIEWER JOINED******\n\n\n\n\n FreeswitchConferenceEventListener ");
//					DeskShareViewerJoinedEvent evt = (DeskShareViewerJoinedEvent) event;
//					System.out.println("************** FreeswitchConferenceEventListener DeskShareViewerJoinedEvent");
//					vcs.deskShareViewerJoined(evt.getRoom(), evt.getCallerIdNum(), evt.getCallerIdName());
//				} else if (event instanceof DeskShareViewerLeftEvent) {
////					System.out.println("********VIEWER LEFT******\n\n\n\n\n FreeswitchConferenceEventListener ");
//					DeskShareViewerLeftEvent evt = (DeskShareViewerLeftEvent) event;
//					System.out.println("************** FreeswitchConferenceEventListener DeskShareViewerLeftEvent");
//					vcs.deskShareViewerLeft(evt.getRoom(), evt.getCallerIdNum(), evt.getCallerIdName());
				} else if (event instanceof DeskShareRecordingEvent) {
					if (((DeskShareRecordingEvent) event).getRecord()) {
						System.out.println("******** Start RECORDING******\n\n\n\n\n FreeswitchConferenceEventListener ");
						DeskShareRecordingEvent evt = (DeskShareRecordingEvent) event;
						System.out.println("************** FreeswitchConferenceEventListener DeskShareRecordingEvent");
						vcs.deskShareRecordingStarted(evt.getRoom(), evt.getRecordingFilename(), evt.getTimestamp());
					} else {
						System.out.println("******** Stop RECORDING******\n\n\n\n\n FreeswitchConferenceEventListener ");
						DeskShareRecordingEvent evt = (DeskShareRecordingEvent) event;
						System.out.println("************** FreeswitchConferenceEventListener DeskShareRecordingEvent");
						vcs.deskShareRecordingStopped(evt.getRoom(), evt.getRecordingFilename(), evt.getTimestamp());
					}
				} else if (event instanceof DeskShareRTMPBroadcastEvent) {
					if (((DeskShareRTMPBroadcastEvent) event).getRecord()) {
						System.out.println("******** Start RTMP Broadcast******\n\n\n\n\n FreeswitchConferenceEventListener ");
						DeskShareRTMPBroadcastEvent evt = (DeskShareRTMPBroadcastEvent) event;
						System.out.println("************** FreeswitchConferenceEventListener DeskShareRTMPBroadcastStartedEvent");
						vcs.deskShareRTMPBroadcastStarted(evt.getRoom(), evt.getRecordingFilename(), evt.getTimestamp());
					} else {
						System.out.println("******** Stop RTMP Broadcast******\n\n\n\n\n FreeswitchConferenceEventListener ");
						DeskShareRTMPBroadcastEvent evt = (DeskShareRTMPBroadcastEvent) event;
						System.out.println("************** FreeswitchConferenceEventListener DeskShareRTMPBroadcastStoppedEvent");
						vcs.deskShareRTMPBroadcastStopped(evt.getRoom(), evt.getRecordingFilename(), evt.getTimestamp());
					}
				}
			}
		};

		runExec.execute(task);
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
