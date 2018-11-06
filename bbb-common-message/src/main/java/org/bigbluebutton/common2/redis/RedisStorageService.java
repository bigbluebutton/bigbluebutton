package org.bigbluebutton.common2.redis;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;

public class RedisStorageService {

    private static Logger log = LoggerFactory.getLogger(RedisStorageService.class);

    private RedisClient redisClient;
    private StatefulRedisConnection<String, String> connection;

    private String host;
    private String password;
    private int port;
    private String clientName;

    public void start() {
        log.info("Starting RedisStorageService");
        RedisURI redisUri = RedisURI.Builder.redis(this.host, this.port)
                .withClientName(this.clientName).build();
        // @todo Add password if provided
        // if (!this.password.isEmpty()) {
        // redisUri.setPassword(this.password);
        // }

        redisClient = RedisClient.create(redisUri);
        redisClient.setOptions(ClientOptions.builder().autoReconnect(true).build());

        connection = redisClient.connect();
    }

    public void stop() {
        connection.close();
        redisClient.shutdown();
        log.info("RedisStorageService Stopped");
    }

    public void recordMeetingInfo(String meetingId, Map<String, String> info) {
        RedisCommands<String, String> commands = connection.sync();
        try {
            if (log.isDebugEnabled()) {
                for (Map.Entry<String, String> entry : info.entrySet()) {
                    log.debug("Storing metadata {} = {}", entry.getKey(), entry.getValue());
                }
            }

            log.debug("Saving metadata in {}", meetingId);
            commands.hmset("meeting:info:" + meetingId, info);
        } catch (Exception e) {
            log.warn("Cannot record the info meeting: {}", meetingId, e);
        } finally {
            connection.close();
        }
    }

    public void recordBreakoutInfo(String meetingId, Map<String, String> breakoutInfo) {
        RedisCommands<String, String> commands = connection.sync();
        try {
            log.debug("Saving breakout metadata in {}", meetingId);
            commands.hmset("meeting:breakout:" + meetingId, breakoutInfo);
        } catch (Exception e) {
            log.warn("Cannot record the info meeting: {}", meetingId, e);
        } finally {
            connection.close();
        }
    }

    public void addBreakoutRoom(String parentId, String breakoutId) {
        RedisCommands<String, String> commands = connection.sync();
        try {
            log.debug("Saving breakout room for meeting {}", parentId);
            commands.sadd("meeting:breakout:rooms:" + parentId, breakoutId);
        } catch (Exception e) {
            log.warn("Cannot record the info meeting:" + parentId, e);
        } finally {
            connection.close();
        }
    }

    public void removeMeeting(String meetingId) {
        RedisCommands<String, String> commands = connection.sync();
        try {
            commands.del("meeting-" + meetingId);
            commands.srem("meetings", meetingId);
        } finally {
            connection.close();
        }
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public void setPort(int port) {
        this.port = port;
    }
}
