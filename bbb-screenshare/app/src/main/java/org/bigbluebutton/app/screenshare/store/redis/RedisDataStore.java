package org.bigbluebutton.app.screenshare.store.redis;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisDataStore {
  private static Logger log = Red5LoggerFactory.getLogger(RedisDataStore.class, "screenshare");

  private JedisPool redisPool;
  private volatile boolean sendMessage = false;
  private int maxThreshold = 1024;
  private final Executor msgSenderExec = Executors.newSingleThreadExecutor();
  private BlockingQueue<IScreenShareData> dataToStore = new LinkedBlockingQueue<IScreenShareData>();
  private final Executor runExec = Executors.newSingleThreadExecutor();

  public void stop() {
    sendMessage = false;
  }

  public void start() {   
    try {
      sendMessage = true;

      Runnable messageSender = new Runnable() {
        public void run() {
          while (sendMessage) {
            try {
              IScreenShareData data = dataToStore.take();
              storeData(data);
            } catch (InterruptedException e) {
              log.warn("Failed to get data from queue.");
            }                           
          }
        }
      };
      msgSenderExec.execute(messageSender);
    } catch (Exception e) {
      log.error("Error storing data into redis: " + e.getMessage());
    }           
  }

  public void store(IScreenShareData data) {
    if (dataToStore.size() > maxThreshold) {
      log.warn("Queued number of data [{}] is greater than threshold [{}]", dataToStore.size(), maxThreshold);
    }
    dataToStore.add(data);
  }

  private void storeData(IScreenShareData data) {
    Runnable task = new Runnable() {
      public void run() {
        Jedis jedis = redisPool.getResource();
        try {
          //              jedis.publish(channel, message);
        } catch(Exception e){
          log.warn("Cannot publish the message to redis", e);
        } finally {
          redisPool.returnResource(jedis);
        }           
      }
    };

    runExec.execute(task);
  }

  public void setRedisPool(JedisPool redisPool){
    this.redisPool = redisPool;
  }

  public void setMaxThreshold(int threshold) {
    maxThreshold = threshold;
  }
}
