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
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.Protocol;

public class EventRecordingService {
	private static Logger log = Red5LoggerFactory.getLogger(EventRecordingService.class, "video");

	private static final String COLON = ":";

	private JedisPool redisPool;
	private final String  host;
	private final int port;
	private final int keyExpiry;
	
	public EventRecordingService(String host, int port, int keyExpiry) {
		this.host = host;
		this.port = port;
		this.keyExpiry = keyExpiry;
	}
	
	public void record(String meetingId, Map<String, String> event) {
		Jedis jedis = redisPool.getResource();
		try {
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
		} catch (Exception e) {
			log.warn("Cannot record the info meeting:" + meetingId, e);
		} finally {
			jedis.close();
		}

	}

	public void stop() {

	}

	public void start() {
		// Set the name of this client to be able to distinguish when doing
		// CLIENT LIST on redis-cli
		redisPool = new JedisPool(new GenericObjectPoolConfig(), host, port, Protocol.DEFAULT_TIMEOUT, null,
			Protocol.DEFAULT_DATABASE, "BbbRed5AppsPub");
	}
}
