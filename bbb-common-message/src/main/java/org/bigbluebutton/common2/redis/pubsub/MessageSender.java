package org.bigbluebutton.common2.redis.pubsub;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.common2.redis.RedisAwareCommunicator;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisFuture;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.async.RedisAsyncCommands;

public class MessageSender extends RedisAwareCommunicator {
    private static Logger log = Red5LoggerFactory.getLogger(MessageSender.class, "bigbluebutton");

    private StatefulRedisConnection<String, String> connection;

    private volatile boolean sendMessage = false;

    private BlockingQueue<MessageToSend> messages = new LinkedBlockingQueue<MessageToSend>();

    public void stop() {
        sendMessage = false;
        redisClient.shutdown();
    }

    public void start() {
        // GenericObjectPoolConfig config = new GenericObjectPoolConfig();
        // config.setMaxTotal(32);
        // config.setMaxIdle(8);
        // config.setMinIdle(1);
        // config.setTestOnBorrow(true);
        // config.setTestOnReturn(true);
        // config.setTestWhileIdle(true);
        // config.setNumTestsPerEvictionRun(12);
        // config.setMaxWaitMillis(5000);
        // config.setTimeBetweenEvictionRunsMillis(60000);
        // config.setBlockWhenExhausted(true);

        // Set the name of this client to be able to distinguish when doing
        // CLIENT LIST on redis-cli // "BbbRed5VoicePub"

        RedisURI redisUri = RedisURI.Builder.redis(this.host, this.port).withClientName(this.clientName).build();
        if (!this.password.isEmpty()) {
            redisUri.setPassword(this.password);
        }

        redisClient = RedisClient.create(redisUri);
        redisClient.setOptions(ClientOptions.builder().autoReconnect(true).build());
        connection = redisClient.connectPubSub();

        log.info("Redis org.bigbluebutton.red5.pubsub.message publisher starting!");
        try {
            sendMessage = true;
            while (sendMessage) {
                try {
                    MessageToSend msg = messages.take();
                    publish(msg.getChannel(), msg.getMessage());
                } catch (InterruptedException e) {
                    log.warn("Failed to get org.bigbluebutton.common2.redis.pubsub from queue.");
                }
            }
        } catch (Exception e) {
            log.error("Error subscribing to channels: " + e.getMessage());
        }
    }

    public void send(String channel, String message) {
        MessageToSend msg = new MessageToSend(channel, message);
        messages.add(msg);
    }

    private void publish(final String channel, final String message) {
        try {
            RedisAsyncCommands<String, String> async = connection.async();
            RedisFuture<Long> future = async.publish(channel, message);
        } catch (Exception e) {
            log.warn("Cannot publish the org.bigbluebutton.red5.pubsub.message to redis", e);
        }
    }
}
