package org.bigbluebutton.voiceconf.sip;


import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.net.DatagramSocket;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class GlobalCall {
    private static final Logger log = Red5LoggerFactory.getLogger( GlobalCall.class, "sip" );

    public static Map<String,String> roomToStreamMap = new ConcurrentHashMap<String,String>();
    public static Map<String,Integer> numberOfUsers = new ConcurrentHashMap<String,Integer>();
    public static Map<String,String> roomToCodecMap = new ConcurrentHashMap<String, String>();
    public static Map<String,KeepGlobalAudioAlive> globalAudioKeepAliverMap = new ConcurrentHashMap<String, KeepGlobalAudioAlive>();
    
    private static boolean roomHasGlobalStream(String roomName) {
        return roomToStreamMap.containsKey(roomName);
    }

    public static synchronized boolean reservePlaceToCreateGlobal(String roomName) {
        if (roomToStreamMap.containsKey(roomName)) {
            return false;
        } else {
            roomToStreamMap.put(roomName, "reserved");
            return true;
        }
    }

    public static synchronized void addGlobalAudioStream(String roomName, String globalAudioStreamName, String codecName, KeepGlobalAudioAlive globalAudioKeepAlive) {
        roomToStreamMap.put(roomName, globalAudioStreamName);
        roomToCodecMap.put(roomName, codecName);
        numberOfUsers.put(roomName, 0);
        globalAudioKeepAliverMap.put(roomName,globalAudioKeepAlive);
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
        log.debug("REMOVING GLOBAL AUDIO FROM ROOM " + roomName);
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
    }

    public static synchronized void removeUser(String roomName) {
        if (numberOfUsers.containsKey(roomName)) {
            int nUsers = numberOfUsers.get(roomName);
            nUsers -=1;
            numberOfUsers.put(roomName, nUsers);
            log.debug("REMOVING USER: Number of users left is " + nUsers);
        }
    }

    public static String getRoomCodec(String roomName) {
        return roomToCodecMap.get(roomName);
    }
}
