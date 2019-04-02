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
package org.bigbluebutton.app.screenshare;


import java.util.Map;

import org.springframework.util.StringUtils;
import redis.clients.jedis.Jedis;

public class EventRecordingService {
	private static final String COLON = ":";
	
	private final String  host;
	private final int port;
	private String password;

	public EventRecordingService(String host,
															 int port,
															 String password) {
		this.host = host;
		this.port = port;

		if (StringUtils.isEmpty(password)) {
			// Need to set to NULL if password is empty so that Jedis won't
			// AUTH with redis. (ralam nov 29, 2018)
			this.password = null;
		} else {
			this.password = password;
		}
	}
	
	public void record(String meetingId, Map<String, String> event) {		
		Jedis jedis = new Jedis(host, port);

		if (password != null) {
			jedis.auth(password);
		}

		Long msgid = jedis.incr("global:nextRecordedMsgId");
		jedis.hmset("recording:" + meetingId + COLON + msgid, event);
		jedis.rpush("meeting:" + meetingId + COLON + "recordings", msgid.toString());						
	}
}
