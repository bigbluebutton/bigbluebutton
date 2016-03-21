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
package org.bigbluebutton.app.video;


import java.util.Map;

import redis.clients.jedis.Jedis;

public class EventRecordingService {
	private static final String COLON = ":";
	
	private final String  host;
	private final int port;
	private final int keyExpiry;
	
	public EventRecordingService(String host, int port, int keyExpiry) {
		this.host = host;
		this.port = port;
		this.keyExpiry = keyExpiry;
	}
	
	public void record(String meetingId, Map<String, String> event) {		
		Jedis jedis = new Jedis(host, port);
		Long msgid = jedis.incr("global:nextRecordedMsgId");
		String key = "recording:" + meetingId + COLON + msgid;
		jedis.hmset(key, event);
		/**
		 * We set the key to expire after 14 days as we are still
		 * recording the event into redis even if the meeting is not
		 * recorded. (ralam sept 23, 2015) 
		 */
		jedis.expire(key, keyExpiry);
		key = "meeting:" + meetingId + COLON + "recordings";
		jedis.rpush(key, msgid.toString());	
		jedis.expire(key, keyExpiry);
	}
}
