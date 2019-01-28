package org.bigbluebutton.voiceconf.sip;


import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class GlobalCall {
    private static final Logger log = Red5LoggerFactory.getLogger( GlobalCall.class, "sip" );

    // Configure hashmap properly (ralam sept 1, 2015)
    // https://ria101.wordpress.com/2011/12/12/concurrenthashmap-avoid-a-common-misuse/
    //
    private static Map<String,String> roomToStreamMap = new ConcurrentHashMap<String, String>(8, 0.9f, 1);
    private static Map<String,Codec> roomToCodecMap = new ConcurrentHashMap<String, Codec>(8, 0.9f, 1);
    private static Map<String,KeepGlobalAudioAlive> globalAudioKeepAliverMap = new ConcurrentHashMap<String, KeepGlobalAudioAlive>(8, 0.9f, 1);

    private static Map<String, VoiceConfToListenOnlyUsersMap> voiceConfToListenOnlyUsersMap = new ConcurrentHashMap<String, VoiceConfToListenOnlyUsersMap>(8, 0.9f, 1);
    
    public static synchronized boolean reservePlaceToCreateGlobal(String roomName) {
        if (roomToStreamMap.containsKey(roomName)) {
            log.debug("There's already a global audio stream for room {}, no need to create a new one", roomName);
            return false;
        } else {
            log.debug("Reserving the place to create a global audio stream for room {}", roomName);
            roomToStreamMap.put(roomName, "reserved");
            return true;
        }
    }

    public static synchronized void addGlobalAudioStream(String voiceConf, String globalAudioStreamName, Codec sipCodec, SipConnectInfo connInfo) {
        log.debug("Adding a global audio stream to room {}", voiceConf);
        roomToStreamMap.put(voiceConf, globalAudioStreamName);
        roomToCodecMap.put(voiceConf, sipCodec);
        voiceConfToListenOnlyUsersMap.put(voiceConf, new VoiceConfToListenOnlyUsersMap(voiceConf));
        KeepGlobalAudioAlive globalAudioKeepAlive = new KeepGlobalAudioAlive(connInfo.getSocket(), connInfo, sipCodec.getCodecId());
        globalAudioKeepAliverMap.put(voiceConf, globalAudioKeepAlive);
        globalAudioKeepAlive.start();
    }

    public static synchronized String getGlobalAudioStream(String voiceConf) {
        return roomToStreamMap.get(voiceConf);
    }

    public static synchronized boolean removeRoomIfUnused(String voiceConf) {
        if (voiceConfToListenOnlyUsersMap.containsKey(voiceConf) && voiceConfToListenOnlyUsersMap.get(voiceConf).numUsers() <= 0) {
            removeRoom(voiceConf);
            return true;
        } else {
            return false;
        }
    }
 
    private static void removeRoom(String voiceConf) {
        log.debug("Removing global audio stream of room {}", voiceConf);
        roomToStreamMap.remove(voiceConf);
        voiceConfToListenOnlyUsersMap.remove(voiceConf);
        roomToCodecMap.remove(voiceConf);
        KeepGlobalAudioAlive globalAudioKeepAlive = globalAudioKeepAliverMap.get(voiceConf);
        globalAudioKeepAlive.halt();
        globalAudioKeepAliverMap.remove(voiceConf);
    }

    public static synchronized void addUser(String clientId, String callerIdName, String voiceConf) {      	
    	if (voiceConfToListenOnlyUsersMap.containsKey(voiceConf)) {
    		VoiceConfToListenOnlyUsersMap map = voiceConfToListenOnlyUsersMap.get(voiceConf);
    		map.addUser(clientId, callerIdName);
    		int numUsers = map.numUsers();
    		log.debug("Adding new user to voiceConf [{}], current number of users on global stream is {}", voiceConf, numUsers);
    	}
      
    }
    
    public static synchronized ListenOnlyUser removeUser(String clientId, String voiceConf) {
    	if (voiceConfToListenOnlyUsersMap.containsKey(voiceConf)) {
    		return voiceConfToListenOnlyUsersMap.get(voiceConf).removeUser(clientId);
    	}
    	return null;
    }

    public static synchronized Collection<ListenOnlyUser> getAllListenOnlyUsers(String voiceConf) {
        if (voiceConfToListenOnlyUsersMap.containsKey(voiceConf)) {
            return voiceConfToListenOnlyUsersMap.get(voiceConf).getAllListenOnlyUsers();
        }
        return null;
    }

    public static Codec getRoomCodec(String roomName) {
        return roomToCodecMap.get(roomName);
    }
}
