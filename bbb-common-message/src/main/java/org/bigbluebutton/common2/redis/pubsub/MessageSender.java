package org.bigbluebutton.common2.redis.pubsub;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.bigbluebutton.common2.redis.RedisAwareCommunicator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisFuture;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.async.RedisAsyncCommands;
import io.lettuce.core.pubsub.StatefulRedisPubSubConnection;
import io.lettuce.core.support.ConnectionPoolSupport;

public class MessageSender extends RedisAwareCommunicator {
    private final Logger log = LoggerFactory.getLogger(MessageSender.class);

    GenericObjectPool<StatefulRedisPubSubConnection<String, String>> connectionPool;

    private volatile boolean sendMessage = false;

    private final Executor msgSenderExec = Executors.newSingleThreadExecutor();
    private final Executor runExec = Executors.newSingleThreadExecutor();
    private BlockingQueue<MessageToSend> messages = new LinkedBlockingQueue<MessageToSend>();

    public void stop() {
        sendMessage = false;
        connectionPool.close();
        redisClient.shutdown();
    }

    public void start() {
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

        log.info("Redis message publisher starting!");
        try {
            sendMessage = true;

            Runnable messageSender = new Runnable() {
                public void run() {
                    while (sendMessage) {
                        try {
                            MessageToSend msg = messages.take();
                            publish(msg.getChannel(), msg.getMessage());
                        } catch (InterruptedException e) {
                            log.warn("Failed to get org.bigbluebutton.common2.redis.pubsub from queue.");
                        }
                    }
                }
            };
            msgSenderExec.execute(messageSender);
        } catch (Exception e) {
            log.error("Error subscribing to channels: {}", e.getMessage());
        }

    }

    public void send(String channel, String message) {
        MessageToSend msg = new MessageToSend(channel, message);
        messages.add(msg);
    }

    private void publish(final String channel, final String message) {
        Runnable task = new Runnable() {
            private RedisFuture<Long> future;

            public void run() {
                try (StatefulRedisPubSubConnection<String, String> connection = connectionPool.borrowObject()) {
                    RedisAsyncCommands<String, String> async = connection.async();
                    future = async.publish(channel, message);
                } catch (Exception e) {
                    log.warn("Cannot publish to redis", e);
                }
            }
        };

        runExec.execute(task);
    }
}
