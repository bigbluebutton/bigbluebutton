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

package org.bigbluebutton.conference.service.recorder.polling;

import java.io.File;
import java.io.FileReader;
import java.lang.reflect.Array;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Scanner;

import javax.servlet.ServletRequest;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import org.apache.commons.lang.time.DateFormatUtils;

import org.bigbluebutton.conference.service.poll.Poll;
import org.bigbluebutton.conference.service.poll.PollApplication;


public class PollInvoker {
	
	private String BBB_FILE = "/var/lib/tomcat6/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties";
	private String BBB_SERVER_FIELD = "bigbluebutton.web.serverURL";
	
    private static Logger log = Red5LoggerFactory.getLogger( PollInvoker.class, "bigbluebutton");
    JedisPool redisPool;

    public PollInvoker(){
    	super();
    }
    
    public JedisPool getRedisPool() {
   	 return redisPool;
   }

   public void setRedisPool(JedisPool pool) {
   	 this.redisPool = pool;
   }

   // The invoke method is called after already determining which poll is going to be used
   // (ie, the presenter has chosen this poll from a list and decided to use it, or it is being used immediately after creation)
   public Poll invoke(String pollKey){
	   Jedis jedis = PollApplication.dbConnect();   
       if (jedis.exists(pollKey))
       {
    	   // Get Boolean values from string-based Redis hash
    	   boolean pMultiple = false;
    	   boolean pStatus = false;
    	   boolean pWebPublish = false;
    	   if (jedis.hget(pollKey, "multiple").compareTo("true") == 0)
    		   pMultiple = true;
    	   if (jedis.hget(pollKey, "status").compareTo("true") == 0) 
    		   pStatus = true;
    	   if (jedis.hget(pollKey, "publishToWeb").compareTo("true") == 0) 
    		   pWebPublish = true;
		
    	   // ANSWER EXTRACTION
    	   long pollSize = jedis.hlen(pollKey);
    	   // otherFields is defined in Poll.java as the number of fields the hash has which are not answers or votes.
    	   long numAnswers = (pollSize-Poll.getOtherFields())/2;
       
    	   // Create an ArrayList of Strings for answers, and one of ints for answer votes
    	   ArrayList <String> pAnswers = new ArrayList <String>();
    	   ArrayList <Integer> pVotes = new ArrayList <Integer>();
    	   for (int j = 1; j <= numAnswers; j++)
    	   {
    		   pAnswers.add(jedis.hget(pollKey, "answer"+j+"text"));
    		   pVotes.add(Integer.parseInt(jedis.hget(pollKey, "answer"+j)));
    	   }
    	       	   
    	   ArrayList retrievedPoll = new ArrayList();
    	   
    	   retrievedPoll.add(jedis.hget(pollKey, "title"));
    	   retrievedPoll.add(jedis.hget(pollKey, "room"));
    	   retrievedPoll.add(pMultiple);
    	   retrievedPoll.add(jedis.hget(pollKey, "question"));
		   retrievedPoll.add(pAnswers);
		   retrievedPoll.add(pVotes);
    	   retrievedPoll.add(jedis.hget(pollKey, "time"));
    	   retrievedPoll.add(jedis.hget(pollKey, "totalVotes"));
    	   retrievedPoll.add(pStatus);
		   retrievedPoll.add(jedis.hget(pollKey, "didNotVote"));    	   
		   retrievedPoll.add(pWebPublish);
		   retrievedPoll.add(jedis.hget(pollKey, "webKey"));
    	   
		   Poll poll = new Poll(retrievedPoll);
    	   return poll;
       }
       log.error("[ERROR] A poll is being invoked that does not exist. Null exception will be thrown.");
       return null;
   }
   
   // Gets the ID of the current room, and returns a list of all available polls.
   public ArrayList <String> titleList()
   { 
	   Jedis jedis = PollApplication.dbConnect();
       String roomName = Red5.getConnectionLocal().getScope().getName();
	   ArrayList <String> pollTitleList = new ArrayList <String>(); 
       for (String s : jedis.keys(roomName+"*"))
       {
    	   pollTitleList.add(jedis.hget(s, "title"));
       }
	   return pollTitleList;
   }
}
