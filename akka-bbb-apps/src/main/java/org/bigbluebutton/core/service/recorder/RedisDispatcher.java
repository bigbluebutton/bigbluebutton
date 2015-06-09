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

import org.apache.commons.pool.impl.GenericObjectPool;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisDispatcher implements Recorder {

	private static final String COLON=":";
	private JedisPool redisPool;
	private GenericObjectPoolConfigWrapper config;
	
	public RedisDispatcher(String host, int port, String password) {
		setupConfig();
		redisPool = new JedisPool(config.getConfig(), host, port);
	}
		
	@Override
	public void record(String session, RecordEvent message) {		
		Jedis jedis = redisPool.getResource();
		try {
			Long msgid = jedis.incr("global:nextRecordedMsgId");
			jedis.hmset("recording" + COLON + session + COLON + msgid, message.toMap());
			jedis.rpush("meeting" + COLON + session + COLON + "recordings", msgid.toString());
		} finally {
			redisPool.returnResource(jedis);
		}						
	}
		
	private void setupConfig() {
		config = new GenericObjectPoolConfigWrapper();
		config.setWhenExhaustedAction(GenericObjectPool.WHEN_EXHAUSTED_FAIL);
		config.setMaxActive(12);
		config.setMaxIdle(6);
		config.setMinIdle(1);
		config.setTestOnBorrow(true);
		config.setTestOnReturn(true);
		config.setTestWhileIdle(true);
		config.setNumTestsPerEvictionRun(12);
		config.setTimeBetweenEvictionRunsMillis(60000);
		config.setMaxWait(5000);
	}

}
