package org.bigbluebutton.voiceconf.sip;


import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.net.DatagramSocket;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class GlobalCall {
    private static final Logger log = Red5LoggerFactory.getLogger( GlobalCall.class, "sip" );

    public static Map<String,String> roomToStreamMap = new ConcurrentHashMap<String,String>();
    public static Map<String,Integer> numberOfUsers = new ConcurrentHashMap<String,Integer>();
    public static Map<String,Codec> roomToCodecMap = new ConcurrentHashMap<String, Codec>();
    public static Map<String,KeepGlobalAudioAlive> globalAudioKeepAliverMap = new ConcurrentHashMap<String, KeepGlobalAudioAlive>();

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

    public static synchronized void addGlobalAudioStream(String roomName, String globalAudioStreamName, Codec sipCodec, SipConnectInfo connInfo) {
        log.debug("Adding a global audio stream to room {}", roomName);
        roomToStreamMap.put(roomName, globalAudioStreamName);
        roomToCodecMap.put(roomName, sipCodec);
        numberOfUsers.put(roomName, 0);
        KeepGlobalAudioAlive globalAudioKeepAlive = new KeepGlobalAudioAlive(connInfo.getSocket(), connInfo, sipCodec.getCodecId());
        globalAudioKeepAliverMap.put(roomName, globalAudioKeepAlive);
        globalAudioKeepAlive.start();
    }

    public static synchronized String getGlobalAudioStream(String roomName) {
        return roomToStreamMap.get(roomName);
    }

    public static synchronized boolean removeRoomIfUnused(String roomName) {
        if (numberOfUsers.containsKey(roomName) && numberOfUsers.get(roomName) <= 0) {
            removeRoom(roomName);
            return true;
        } else {
            return false;
        }
    }
 
    private static void removeRoom(String roomName) {
        log.debug("Removing global audio stream of room {}", roomName);
        roomToStreamMap.remove(roomName);
        numberOfUsers.remove(roomName);
        roomToCodecMap.remove(roomName);
        KeepGlobalAudioAlive globalAudioKeepAlive = globalAudioKeepAliverMap.get(roomName);
        globalAudioKeepAlive.halt();
        globalAudioKeepAliverMap.remove(roomName);
    }

    public static synchronized void addUser(String roomName) {
        int nUsers = numberOfUsers.get(roomName);
        nUsers += 1;
        numberOfUsers.put(roomName, nUsers);
        log.debug("Adding new user to room {}, current number of users on global stream is {}", roomName, nUsers);
    }

    public static synchronized void removeUser(String roomName) {
        if (numberOfUsers.containsKey(roomName)) {
            int nUsers = numberOfUsers.get(roomName);
            nUsers -= 1;
            numberOfUsers.put(roomName, nUsers);
            log.debug("Removing user from room {}, current number of users on global stream is {}", roomName, nUsers);
        }
    }

    public static Codec getRoomCodec(String roomName) {
        return roomToCodecMap.get(roomName);
    }
}
