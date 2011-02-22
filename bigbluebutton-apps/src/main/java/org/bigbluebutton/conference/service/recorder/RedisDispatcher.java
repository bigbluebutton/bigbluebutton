package org.bigbluebutton.conference.service.recorder;

import org.apache.commons.pool.impl.GenericObjectPool.Config;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisException;
import redis.clients.jedis.JedisPool;

public class RedisDispatcher implements Recorder {
	private static final String COLON=":";
	private String host;
	private int port;

	private Jedis jedis;

	
//	Jedis jedis;
	JedisPool jpool;
	public RedisDispatcher(String host, int port){
		this.host = host;
		this.port = port;
		
		jedis = new Jedis(host, port);		
//		Config poolConfig = new Config();
//		jpool = new JedisPool(poolConfig, host, port);
	}
	
	@Override
	public void record(String session, RecordEvent message) {
		//Jedis jedis = new Jedis(host, port);
		Long msgid = jedis.incr("global:nextRecordedMsgId");
		jedis.hmset("recording" + COLON + session + COLON + msgid, message.toMap());
		jedis.rpush("meeting" + COLON + session + COLON + "recordings", msgid.toString());						
	}
/*	
	@Override
	public void record(String session, RecordEvent message) {
		boolean tryAgain = true;
		int howMany = 10;
		while (tryAgain) {
			Jedis jedis = jpool.getResource();
			try {
				Long msgid = jedis.incr("global:nextRecordedMsgId");
				jedis.hmset("recording" + COLON + session + COLON + msgid, message.toMap());
				jedis.rpush("meeting" + COLON + session + COLON + "recordings", msgid.toString());
				jpool.returnResource(jedis);				
			} catch(JedisException e) {
				System.out.println("Failed to get redis connection...trying again...");
				if (howMany < 0) {
					tryAgain = false;
				} else {
					howMany--;
					jpool.returnBrokenResource(jedis);
				}
			}
			
		}
	}
<<<<<<< Updated upstream
*/

	public Jedis getJedis(){
		return jedis;
	}

}
