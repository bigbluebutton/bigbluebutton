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
package org.bigbluebutton.deskshare.server.recorder;

import java.util.concurrent.TimeUnit;
import org.bigbluebutton.deskshare.server.recorder.event.AbstractDeskshareRecordEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordStartedEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordStoppedEvent;
import redis.clients.jedis.Jedis;


public class EventRecorder implements RecordStatusListener {
	private static final String COLON=":";
	private String host;
	private int port;
	private final int keyExpiry;
	
	public EventRecorder(String host, int port, int keyExpiry){
		this.host = host;
		this.port = port;		
		this.keyExpiry = keyExpiry;
	}
	
  private Long genTimestamp() {
  	return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }
  
	private void record(String session, RecordEvent message) {
		Jedis jedis = new Jedis(host, port);
		Long msgid = jedis.incr("global:nextRecordedMsgId");
		String key = "recording" + COLON + session + COLON + msgid;
		jedis.hmset(key, message.toMap());
		/**
		 * We set the key to expire after 14 days as we are still
		 * recording the event into redis even if the meeting is not
		 * recorded. (ralam sept 23, 2015) 
		 */
		jedis.expire(key, keyExpiry);
		key = "meeting" + COLON + session + COLON + "recordings";
		jedis.rpush(key, msgid.toString());
		jedis.expire(key, keyExpiry);
	}
	
	@Override
	public void notify(RecordEvent event) {
		if ((event instanceof RecordStoppedEvent) || (event instanceof RecordStartedEvent)) {
			event.setTimestamp(genTimestamp());
			event.setMeetingId(((AbstractDeskshareRecordEvent)event).getSession());
			record(((AbstractDeskshareRecordEvent)event).getSession(), event);
		}
	}
}
