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
package org.bigbluebutton.core.service.recorder;

import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.Protocol;

public class RedisDispatcher implements Recorder {

	private static final String COLON=":";
	private JedisPool redisPool;
	private int keysExpiresInSec;
	
	public RedisDispatcher(String host, int port, String password, int keysExpiresInSec) {
		GenericObjectPoolConfig config = new GenericObjectPoolConfig();
		config.setMaxTotal(32);
		config.setMaxIdle(8);
		config.setMinIdle(1);
		config.setTestOnBorrow(true);
		config.setTestOnReturn(true);
		config.setTestWhileIdle(true);
		config.setNumTestsPerEvictionRun(12);
		config.setMaxWaitMillis(5000);
		config.setTimeBetweenEvictionRunsMillis(60000);
		config.setBlockWhenExhausted(true);
		
		this.keysExpiresInSec = keysExpiresInSec;
		
		// Set the name of this client to be able to distinguish when doing
		// CLIENT LIST on redis-cli
		redisPool = new JedisPool(config, host, port, Protocol.DEFAULT_TIMEOUT, null,
		        Protocol.DEFAULT_DATABASE, "BbbAppsAkkaRec");
	}
		
	@Override
	public void record(String session, RecordEvent message) {		
		Jedis jedis = redisPool.getResource();
		try {
			Long msgid = jedis.incr("global:nextRecordedMsgId");
			String key = "recording" + COLON + session + COLON + msgid;
			jedis.hmset(key, message.toMap());
			jedis.expire(key, keysExpiresInSec);
			key = "meeting" + COLON + session + COLON + "recordings";
			jedis.rpush(key, msgid.toString());
			jedis.expire(key, keysExpiresInSec);
		} finally {
			jedis.close();
		}						
	}
		
}
