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
package org.bigbluebutton.conference.service.recorder;

import org.slf4j.Logger;
import org.bigbluebutton.service.recording.RedisListRecorder;
import org.red5.logging.Red5LoggerFactory;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * 
 * The RecorderApplication class is used for setting the record module 
 * in BigBlueButton for send events messages to a JMS queue.
 * The class follows the same standard as the others modules of BigBlueButton Apps.
 */
public class RecorderApplication {
	private static Logger log = Red5LoggerFactory.getLogger(RecorderApplication.class, "bigbluebutton");
	
	private static final int NTHREADS = 1;
	private static final Executor exec = Executors.newFixedThreadPool(NTHREADS);
	private static final Executor runExec = Executors.newFixedThreadPool(NTHREADS);
	
	private BlockingQueue<RecordEvent> messages;
	private volatile boolean recordEvents = false;

  private RedisListRecorder redisListRecorder;
  
	private Recorder recorder;
	
	public RecorderApplication() {
		 messages = new LinkedBlockingQueue<RecordEvent>();
	}

	public void start() {
		recordEvents = true;
		Runnable sender = new Runnable() {
			public void run() {
				while (recordEvents) {
					RecordEvent message;
					try {
						message = messages.take();
						recordEvent(message);	
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
									
				}
			}
		};
		exec.execute(sender);		
	}
	
	public void stop() {
		recordEvents = false;
	}

	public void destroyRecordSession(String meetingID) {
//		recordingSessions.remove(meetingID);
	}
	
	public void createRecordSession(String meetingID) {
//		recordingSessions.put(meetingID, meetingID);
	}
	
	public void record(String meetingID, RecordEvent message) {
		messages.offer(message);
	}

	private void recordEvent(final RecordEvent message) {
		Runnable task = new Runnable() {
			public void run() {
			  recorder.record(message.getMeetingID(), message);
			}
		};
		runExec.execute(task);
	}
	
	public void setRecorder(Recorder recorder) {
		this.recorder = recorder;
		log.debug("setting recorder");
	}
	
	public void setRedisListRecorder(RedisListRecorder rec) {
		redisListRecorder = rec;
	}
}

