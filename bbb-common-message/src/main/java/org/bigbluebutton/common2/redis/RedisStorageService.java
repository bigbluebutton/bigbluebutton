/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.common2.redis;

import java.security.SecureRandom;
import java.util.Map;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import io.lettuce.core.api.sync.BaseRedisCommands;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.ScriptOutputType;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import org.apache.commons.codec.binary.Hex;

public class RedisStorageService extends RedisAwareCommunicator {

    private static Logger log = LoggerFactory.getLogger(RedisStorageService.class);

    StatefulRedisConnection<String, String> connection;

    public void start() {
        log.info("Starting RedisStorageService with client name: clientName={}", clientName);
        RedisURI.Builder redisUriBuilder = RedisURI.Builder.redis(this.host, this.port)
                .withClientName(this.clientName);
        if (!this.password.isEmpty()) {
            redisUriBuilder.withPassword(this.password.toCharArray());
        }
        RedisURI redisUri = redisUriBuilder.build();

        redisClient = RedisClient.create(redisUri);
        redisClient.setOptions(ClientOptions.builder().autoReconnect(true).build());
        eventBus = redisClient.getResources().eventBus();
        eventBusSubscription = eventBus.get().subscribe(e -> connectionStatusHandler(e, log));

        connection = redisClient.connect();
    }

    public void stop() {
        eventBusSubscription.dispose();
        connection.close();
        redisClient.shutdown();
        log.info("RedisStorageService Stopped");
    }

    // Each caption-token operation is a single Redis command.
    private static final String STORE_CAPTION_TOKEN =
            "redis.call('HSET', KEYS[1], 'recordId', ARGV[1], 'caption', ARGV[2]) " +
            "redis.call('EXPIRE', KEYS[1], ARGV[3]) " +
            "return 1";

    private static final String CONSUME_CAPTION_TOKEN =
            "local v = redis.call('HMGET', KEYS[1], 'recordId', 'caption') " +
            "if v[1] == ARGV[1] and v[2] == ARGV[2] then return redis.call('DEL', KEYS[1]) end " +
            "return 0";

    private static final SecureRandom TOKEN_RANDOM = new SecureRandom();

    public String generateSingleUseCaptionToken(String recordId, String caption, Long expirySeconds) {
        byte[] tokenBytes = new byte[20];
        TOKEN_RANDOM.nextBytes(tokenBytes);
        String token = Hex.encodeHexString(tokenBytes);
        String key = "captions:" + token + ":singleusetoken";
        RedisCommands<String, String> commands = connection.sync();
        commands.eval(STORE_CAPTION_TOKEN, ScriptOutputType.INTEGER, new String[] { key },
                recordId, caption, Long.toString(expirySeconds));

        return token;
    }

    public Boolean validateSingleUseCaptionToken(String token, String recordId, String caption) {
        String key = "captions:" + token + ":singleusetoken";
        RedisCommands<String, String> commands = connection.sync();
        Long deleted = commands.eval(CONSUME_CAPTION_TOKEN, ScriptOutputType.INTEGER, new String[] { key },
                recordId, caption);

        return deleted != null && deleted == 1;
    }

    public void recordMeetingInfo(String meetingId, Map<String, String> info) {
        recordMeeting(Keys.MEETING_INFO + meetingId, info);
    }

    public void recordBreakoutInfo(String meetingId, Map<String, String> breakoutInfo) {
        recordMeeting(Keys.BREAKOUT_MEETING + meetingId, breakoutInfo);
    }

    public void addBreakoutRoom(String parentId, String breakoutId) {
        RedisCommands<String, String> commands = connection.sync();
        commands.sadd(Keys.BREAKOUT_ROOMS + parentId, breakoutId);
    }

    public void record(String meetingId, Map<String, String> event) {
        RedisCommands<String, String> commands = connection.sync();
        Long msgid = commands.incr("global:nextRecordedMsgId");
        commands.multi();
        commands.hmset("recording:" + meetingId + ":" + msgid, event);
        commands.rpush("meeting:" + meetingId + ":" + "recordings", Long.toString(msgid));
        commands.exec();
    }

    public void storePresentationAnnotations(String meetingId, Map<String, String> event, String msgType) {
        RedisCommands<String, String> commands = connection.sync();      
        
        commands.multi();
        
        switch (msgType) {
            case "PresAnn": {
                commands.hmset(event.get("jobId"), event);
                break;
            }

            case "ExportJob": {
                Gson gson = new Gson();
                String exportJobAsJson = gson.toJson(event);
                commands.rpush("exportJobs", exportJobAsJson.toString());
                break;
            }

            default: {
                log.error("Attempted to store PresentationAnnotations message of type: {}", clientName);
                break;
            }
        }

        commands.exec();
    }

    // @fixme: not used anywhere
    public void removeMeeting(String meetingId) {
        RedisCommands<String, String> commands = connection.sync();
        commands.multi();
        commands.del(Keys.MEETING + meetingId);
        commands.srem(Keys.MEETINGS + meetingId);
        commands.exec();
    }

    public void recordAndExpire(String meetingId, Map<String, String> event) {
        RedisCommands<String, String> commands = connection.sync();

        Long msgid = commands.incr("global:nextRecordedMsgId");
        String key = "recording:" + meetingId + ":" + msgid;
        commands.multi();
        commands.hmset(key, event);
        /**
         * We set the key to expire after 14 days as we are still recording the
         * event into redis even if the meeting is not recorded. (ralam sept 23,
         * 2015)
         */
        commands.expire(key, expireKey);
        key = "meeting:" + meetingId + ":recordings";
        commands.rpush(key, Long.toString(msgid));
        commands.expire(key, expireKey);
        commands.exec();
    }

    private String recordMeeting(String key, Map<String, String> info) {
        String result = "";
        RedisCommands<String, String> commands = connection.sync();
        result = commands.hmset(key, info);
        return result;
    }

    public Boolean checkConnectionStatusBasic() {
        BaseRedisCommands command = connection.sync();
        String response = command.ping();

        return response.equals("PONG");
    }
}
