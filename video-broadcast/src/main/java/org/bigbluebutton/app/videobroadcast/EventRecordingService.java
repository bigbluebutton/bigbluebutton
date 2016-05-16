/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.app.videobroadcast;


import java.util.Map;

import redis.clients.jedis.Jedis;

public class EventRecordingService {
	private static final String COLON = ":";

	private final String  host;
	private final int port;

	public EventRecordingService(String host, int port) {
		this.host = host;
		this.port = port;
	}

	public void record(String meetingId, Map<String, String> event) {
		Jedis jedis = new Jedis(host, port);
		Long msgid = jedis.incr("global:nextRecordedMsgId");
		jedis.hmset("recording:" + meetingId + COLON + msgid, event);
		jedis.rpush("meeting:" + meetingId + COLON + "recordings", msgid.toString());
	}
}
