package org.bigbluebutton.common2.redis.pubsub;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.bigbluebutton.common2.redis.RedisAwareCommunicator;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisFuture;
import io.lettuce.core.RedisURI;
import io.lettuce.core.pubsub.RedisPubSubListener;
import io.lettuce.core.pubsub.StatefulRedisPubSubConnection;
import io.lettuce.core.pubsub.api.async.RedisPubSubAsyncCommands;
import io.lettuce.core.support.ConnectionPoolSupport;

public class MessageReceiver extends RedisAwareCommunicator {
    private static Logger log = Red5LoggerFactory.getLogger(MessageReceiver.class, "video");

    private ReceivedMessageHandler handler;

    GenericObjectPool<StatefulRedisPubSubConnection<String, String>> connectionPool;

    private final Executor runExec = Executors.newSingleThreadExecutor();

    private volatile boolean receiveMessage = false;

    private final String FROM_BBB_APPS_PATTERN = "from-akka-apps-redis-channel";

    public void start() {
        log.info("Ready to receive messages from Redis pubsub.");
        receiveMessage = true;

        RedisURI redisUri = RedisURI.Builder.redis(this.host, this.port).withClientName(this.clientName).build();
        if (!this.password.isEmpty()) {
            redisUri.setPassword(this.password);
        }

        redisClient = RedisClient.create(redisUri);
        redisClient.setOptions(ClientOptions.builder().autoReconnect(true).build());
        eventBus = redisClient.getResources().eventBus();
        eventBusSubscription = eventBus.get().subscribe(e -> connectionStatusHandler(e, log));

        connectionPool = ConnectionPoolSupport.createGenericObjectPool(() -> redisClient.connectPubSub(),
                createPoolingConfig());

        Runnable messageReceiver = new Runnable() {
            public void run() {
                if (receiveMessage) {
                    try (StatefulRedisPubSubConnection<String, String> connection = connectionPool.borrowObject()) {
                        if (receiveMessage) {
                            connection.addListener(new MessageListener());

                            RedisPubSubAsyncCommands<String, String> async = connection.async();
                            RedisFuture<Void> future = async.subscribe(FROM_BBB_APPS_PATTERN);
                        }
                    } catch (Exception e) {
                        log.error("Error resubscribing to channels: ", e);
                    }
                }
            }
        };

        runExec.execute(messageReceiver);
    }

    public void stop() {
        receiveMessage = false;
        connectionPool.close();
        redisClient.shutdown();
        log.info("MessageReceiver Stopped");
    }

    public void setMessageHandler(ReceivedMessageHandler handler) {
        this.handler = handler;
    }

    private class MessageListener implements RedisPubSubListener<String, String> {

        @Override
        public void message(String channel, String message) {
            handler.handleMessage("", channel, message);
        }

        @Override
        public void message(String pattern, String channel, String message) {
            log.debug("RECEIVED onPMessage" + channel + " message=\n" + message);
            Runnable task = new Runnable() {
                public void run() {
                    handler.handleMessage(pattern, channel, message);
                }
            };

            runExec.execute(task);
        }

        @Override
        public void subscribed(String channel, long count) {
            log.debug("Subscribed to the channel: " + channel);
        }

        @Override
        public void psubscribed(String pattern, long count) {
            log.debug("Subscribed to the pattern: " + pattern);
        }

        @Override
        public void unsubscribed(String channel, long count) {
            log.debug("Unsubscribed from the channel: " + channel);
        }

        @Override
        public void punsubscribed(String pattern, long count) {
            log.debug("Unsubscribed from the pattern: " + pattern);
        }
    }

}
