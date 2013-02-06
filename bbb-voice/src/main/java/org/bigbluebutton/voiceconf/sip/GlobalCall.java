package org.bigbluebutton.voiceconf.sip;


import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.net.DatagramSocket;

public class GlobalCall {
    
    public static Map<String,String> voiceConference = new ConcurrentHashMap<String,String>();
    public static Map<String,Integer> numberOfUsers = new ConcurrentHashMap<String,Integer>();
    public static Map<String,String> codecVoiceConference = new ConcurrentHashMap<String, String>();
    public static Map<String,KeepGlobalAudioAlive> globalAudioKeepAliverMap = new ConcurrentHashMap<String, KeepGlobalAudioAlive>();
    
    public static boolean roomHasGlobalStream(String roomName) {
	return voiceConference.containsKey(roomName);
    }

    public static void addGlobalAudioStream(String roomName, String globalAudioStreamName, String codecName, KeepGlobalAudioAlive globalAudioKeepAlive) {
	voiceConference.put(roomName, globalAudioStreamName);
	codecVoiceConference.put(roomName, codecName);
	numberOfUsers.put(roomName, 0);
	globalAudioKeepAliverMap.put(roomName,globalAudioKeepAlive);
	globalAudioKeepAlive.start();
    }

    public static String getGlobalAudioStream(String roomName) {
	return voiceConference.get(roomName);
    }
 
    public static void removeRoom(String roomName) {
	System.out.println("REMOVING GLOBAL AUDIO FROM ROOM "+roomName);
	voiceConference.remove(roomName);
	numberOfUsers.remove(roomName);
	codecVoiceConference.remove(roomName);
	KeepGlobalAudioAlive globalAudioKeepAlive = globalAudioKeepAliverMap.get(roomName);
	globalAudioKeepAlive.halt();
	globalAudioKeepAliverMap.remove(roomName);
    }

    public static void addUser(String roomName) {
	int nUsers = numberOfUsers.get(roomName);
	nUsers+=1;
    	numberOfUsers.put(roomName, nUsers);	
    }

    public static void removeUser(String roomName) {
	
	if(numberOfUsers.containsKey(roomName)) {
		int nUsers = numberOfUsers.get(roomName);
		nUsers-=1;
		numberOfUsers.put(roomName, nUsers);
		System.out.println("REMOVING USER: Number of users left is " + nUsers);
	}
    }

    public static int getNumberOfUsers(String roomName) {
    	return numberOfUsers.get(roomName);
    }

    public static String getRoomCodec(String roomName) {
	return codecVoiceConference.get(roomName);
    }


}
