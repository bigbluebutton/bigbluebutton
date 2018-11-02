package org.bigbluebutton.api.messaging;

import java.util.Map;

import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.Protocol;

public class RedisStorageService {
  private static Logger log = LoggerFactory.getLogger(RedisStorageService.class);

  private JedisPool redisPool;
  private String host;
  private int port;

  public void stop() {

  }

  public void start() {
    // Set the name of this client to be able to distinguish when doing
    // CLIENT LIST on redis-cli
    redisPool = new JedisPool(new GenericObjectPoolConfig<Object>(), host, port, Protocol.DEFAULT_TIMEOUT, null,
      Protocol.DEFAULT_DATABASE, "BbbRed5AppsPub");
  }

  public void recordMeetingInfo(String meetingId, Map<String, String> info) {
    Jedis jedis = redisPool.getResource();
    try {
      if (log.isDebugEnabled()) {
        for (Map.Entry<String,String> entry : info.entrySet()) {
          log.debug("Storing metadata {} = {}", entry.getKey(), entry.getValue());
        }
      }

      log.debug("Saving metadata in {}", meetingId);
      jedis.hmset("meeting:info:" + meetingId, info);
    } catch (Exception e) {
      log.warn("Cannot record the info meeting: {}", meetingId, e);
    } finally {
      jedis.close();
    }
  }

  public void recordBreakoutInfo(String meetingId, Map<String, String> breakoutInfo) {
    Jedis jedis = redisPool.getResource();
    try {
      log.debug("Saving breakout metadata in {}", meetingId);
      jedis.hmset("meeting:breakout:" + meetingId, breakoutInfo);
    } catch (Exception e) {
      log.warn("Cannot record the info meeting: {}", meetingId, e);
    } finally {
      jedis.close();
    }
  }

  public void addBreakoutRoom(String parentId, String breakoutId) {
    Jedis jedis = redisPool.getResource();
    try {

      log.debug("Saving breakout room for meeting {}", parentId);
      jedis.sadd("meeting:breakout:rooms:" + parentId, breakoutId);
    } catch (Exception e) {
      log.warn("Cannot record the info meeting:" + parentId, e);
    } finally {
      jedis.close();
    }
  }

  public void removeMeeting(String meetingId) {
    Jedis jedis = redisPool.getResource();
    try {
      jedis.del("meeting-" + meetingId);
      jedis.srem("meetings", meetingId);
    } finally {
      jedis.close();
    }
  }

  public void setHost(String host) {
    this.host = host;
  }

  public void setPort(int port) {
    this.port = port;
  }
}
