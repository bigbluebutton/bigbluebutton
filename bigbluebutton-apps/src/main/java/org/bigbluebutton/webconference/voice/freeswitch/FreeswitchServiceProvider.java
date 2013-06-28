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

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.bigbluebutton.webconference.voice.ConferenceServiceProvider;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class FreeswitchServiceProvider implements ConferenceServiceProvider {
	private static Logger log = Red5LoggerFactory.getLogger(FreeswitchServiceProvider.class, "bigbluebutton");
	
	private static final int SENDERTHREADS = 1;
	private static final Executor msgSenderExec = Executors.newFixedThreadPool(SENDERTHREADS);
	
	private BlockingQueue<String> messageToSend;
	
	private static final int NOTIFIERTHREADS = 1;
	private static final Executor notifierExec = Executors.newFixedThreadPool(NOTIFIERTHREADS);
	private BlockingQueue<String> eslMessages;
	
	private ConferenceServiceProvider appDelegate;
	private ConferenceEventListener conferenceEventListener;
	
	@Override
    public void record(String room, String meetingid){
    	appDelegate.record(room,meetingid);
    }

	@Override
    public void broadcast(String room, String meetingid){
    	appDelegate.broadcast(room,meetingid);
    }
	
	@Override
	public void eject(String room, Integer participant) {
		appDelegate.eject(room, participant);
	}

	@Override
	public void ejectAll(String room) {
		appDelegate.ejectAll(room);
	}
	
	@Override
	public void mute(String room, Integer participant, Boolean mute) {
		appDelegate.mute(room, participant, mute);
	}

	@Override
	public void populateRoom(String room) {
		appDelegate.populateRoom(room);
	}

	@Override
	public void shutdown() {
		appDelegate.shutdown();
	}

	@Override
	public boolean startup() {
		return true;
	}
	
	public void setFreeswitchApplication(FreeswitchApplication f) {
		appDelegate = f;		
    }
	
	

}
