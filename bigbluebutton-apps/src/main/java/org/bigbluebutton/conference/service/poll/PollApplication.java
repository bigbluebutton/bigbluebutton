/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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

package org.bigbluebutton.conference.service.poll;

import java.net.*;
import java.util.List;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import java.util.ArrayList;
import java.io.*;
import java.util.Scanner;

import org.bigbluebutton.conference.service.poll.PollRoomsManager;
import org.bigbluebutton.conference.service.poll.PollRoom;
import org.bigbluebutton.conference.service.poll.IPollRoomListener;
import org.bigbluebutton.conference.service.recorder.polling.PollRecorder;
import org.bigbluebutton.conference.service.recorder.polling.PollInvoker;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class PollApplication {

	private static Logger log = Red5LoggerFactory.getLogger( PollApplication.class, "bigbluebutton" );	
		
	private static final String APP = "Poll";
	private PollRoomsManager roomsManager;
	private String CURRENTKEY = "bbb-polling-webID";
	private Integer MAX_WEBKEYS	= 9999;
	private Integer MIN_WEBKEYS	= 1000;
	private static String BBB_FILE = "/var/lib/tomcat6/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties";
	private static String BBB_SERVER_FIELD = "bigbluebutton.web.serverURL";
	
	public PollHandler handler;
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new PollRoom(name));
		return true;
	}
	
	public boolean destroyRoom(String name) {
		if (roomsManager.hasRoom(name))
			roomsManager.removeRoom(name);
		destroyPolls(name);
		return true;
	}
			
	public void destroyPolls(String name){
		// Destroy polls that were created in the room
		Jedis jedis = dbConnect();
		ArrayList polls = titleList();
		for (int i = 0; i < polls.size(); i++){
			String pollKey = name + "-" + polls.get(i).toString();
			Poll doomedPoll = getPoll(pollKey);
			if (doomedPoll.publishToWeb){
				cutOffWebPoll(pollKey);
			}
			try{
				jedis.del(pollKey);
			}
			catch (Exception e){
				log.error("Poll deletion failed.");
			}
		}
	}
	
	public void cutOffWebPoll(String pollKey){
		Jedis jedis = dbConnect();
		String webKey = jedis.hget(pollKey, "webKey");
		try{
			jedis.del(webKey);
		}
		catch (Exception e){
			log.error("Error in deleting web key " + webKey);
		}
	}
	
	public boolean hasRoom(String name) {
		return roomsManager.hasRoom(name);
	}
	
	public boolean addRoomListener(String room, IPollRoomListener listener) {
		if (roomsManager.hasRoom(room)){
			roomsManager.addRoomListener(room, listener);
			return true;
		}
		log.error("Adding listener to a non-existant room " + room);
		return false;
	}
	
	public void setRoomsManager(PollRoomsManager r) {
		log.debug("Setting room manager");
		roomsManager = r;
	}
	
	public void savePoll(Poll poll) {
        PollRecorder pollRecorder = new PollRecorder();
        pollRecorder.record(poll);
	}
	
	public Poll getPoll(String pollKey)
	{
		PollInvoker pollInvoker = new PollInvoker();
		return pollInvoker.invoke(pollKey);
	}
	
	// AnswerIDs comes in as an array of each answer the user voted for
	// If they voted for answers 3 and 5, the array could be [0] = 3, [1] = 5 or the other way around, shouldn't matter
	public void vote(String pollKey, Object[] answerIDs, Boolean webVote){
		PollRecorder recorder = new PollRecorder();
	    Poll poll = getPoll(pollKey);
	    recorder.vote(pollKey, poll, answerIDs, webVote);
	}
	
	public ArrayList titleList()
	{
		PollInvoker pollInvoker = new PollInvoker();
		ArrayList titles = pollInvoker.titleList();
		return titles;
	}
	
	public void setStatus(String pollKey, Boolean status){
		PollRecorder pollRecorder = new PollRecorder();
        pollRecorder.setStatus(pollKey, status);
	}
	
	public ArrayList generate(String pollKey){
		Jedis jedis = dbConnect();
		if (!jedis.exists(CURRENTKEY)){
			Integer base = MIN_WEBKEYS -1;
			jedis.set(CURRENTKEY, base.toString());
		}
		// The value stored in the bbb-polling-webID key represents the next available web-friendly poll ID 		
		ArrayList webInfo = new ArrayList();
		
		String nextWebKey = webKeyIncrement(Integer.parseInt(jedis.get(CURRENTKEY)), jedis);
		jedis.del(nextWebKey);
		jedis.set(nextWebKey, pollKey);
		// Save the webKey that is being used as part of the poll key, for quick reference later
		jedis.hset(pollKey, "webKey", nextWebKey);
		// Replace the value stored in bbb-polling-webID
		jedis.set(CURRENTKEY, nextWebKey);
		webInfo.add(nextWebKey);
		String hostname = getLocalIP();
		webInfo.add(hostname);
		
		return webInfo;
	}
	
	private String webKeyIncrement(Integer index, Jedis jedis){
		String nextIndex;
		if (++index <= MAX_WEBKEYS){
			nextIndex = index.toString();
		}else{
			nextIndex = MIN_WEBKEYS.toString();
		}
		return nextIndex;
	}
	
	public static Jedis dbConnect(){
		String serverIP = "127.0.0.1";
		//String serverIP = getLocalIP();
		//serverIP = serverIP.substring(7);
		JedisPool redisPool = new JedisPool(serverIP, 6379);
		try{
			return redisPool.getResource();
		}
		catch (Exception e){
			log.error("Error in PollApplication.dbConnect():");
			log.error(e.toString());
		}
		log.error("Returning NULL from dbConnect()");
		return null;
	}
	
    private static String getLocalIP()
    {
    	File parseFile = new File(BBB_FILE);
    	try{    		
    		Scanner scanner = new Scanner(new FileReader(parseFile));
        	Boolean found = false;
    		String serverAddress = "";
    		while (!found && scanner.hasNextLine()){
    			serverAddress = processLine(scanner.nextLine());
    			if (!serverAddress.equals("")){
    				found = true;
    			}
    		}
    		scanner.close();
    		return serverAddress;
    	}
    	catch (Exception e){
    		log.error("Error in scanning " + BBB_FILE + " to find server address.");
    	}
    	return null;
    }
    
    private static String processLine(String line){
    	//use a second Scanner to parse the content of each line 
        Scanner scanner = new Scanner(line);
        scanner.useDelimiter("=");
        if ( scanner.hasNext() ){
        	String name = scanner.next();
        	if (name.equals(BBB_SERVER_FIELD)){
        		String value = scanner.next();
        		return value;
        	}
        }
        return "";
    }
}