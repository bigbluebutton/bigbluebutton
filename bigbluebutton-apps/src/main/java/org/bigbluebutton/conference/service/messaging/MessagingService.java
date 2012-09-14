package org.bigbluebutton.conference.service.messaging;

import redis.clients.jedis.Jedis;

public interface MessagingService {
	public void start();
	public void stop();
	public void send(String channel, String message);
	public void addListener(MessageListener listener);
	public void removeListener(MessageListener listener);
	public Jedis createRedisClient();
	public void dropRedisClient(Jedis jedis);
}
