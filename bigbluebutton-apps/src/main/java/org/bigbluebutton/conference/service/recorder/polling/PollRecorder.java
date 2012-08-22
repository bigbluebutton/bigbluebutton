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

import java.net.InetAddress;

import javax.servlet.ServletRequest;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import java.util.ArrayList;

import org.apache.commons.lang.time.DateFormatUtils;

import org.bigbluebutton.conference.service.poll.Poll;
import org.bigbluebutton.conference.service.poll.PollApplication;

public class PollRecorder {
        private static Logger log = Red5LoggerFactory.getLogger( PollRecorder.class, "bigbluebutton");

        JedisPool redisPool;

         public PollRecorder() {
        	 super();
         }
         
        public JedisPool getRedisPool() {
        	 return redisPool;
        }

        public void setRedisPool(JedisPool pool) {
        	 this.redisPool = pool;
        }
        
        public void record(Poll poll) {
            Jedis jedis = PollApplication.dbConnect();
            // Merges the poll title, room into a single string seperated by a hyphen
			String pollKey = poll.room + "-" + poll.title;
			// Saves all relevant information about the poll as fields in a hash
			jedis.hset(pollKey, "title", poll.title);
			jedis.hset(pollKey, "question", poll.question);
			jedis.hset(pollKey, "multiple", poll.isMultiple.toString());
			jedis.hset(pollKey, "room", poll.room);
			jedis.hset(pollKey, "time", poll.time);
			// Dynamically creates enough fields in the hash to store all of the answers and their corresponding votes.
			// If the poll is freshly created and has no votes yet, the votes are initialized at zero;
			// otherwise it fetches the previous number of votes.
			for (int i = 1; i <= poll.answers.size(); i++)
			{
				jedis.hset(pollKey, "answer"+i+"text", poll.answers.toArray()[i-1].toString());
				if (poll.votes == null){
					jedis.hset(pollKey, "answer"+i, "0");					
				}else{
					jedis.hset(pollKey, "answer"+i, poll.votes.toArray()[i-1].toString());
				}
			}
			Integer tv = poll.totalVotes;
			String totalVotesStr = tv.toString();
			Integer dnv = poll.didNotVote;
			String didNotVoteStr = dnv.toString();
			if (totalVotesStr == null){
				jedis.hset(pollKey, "totalVotes", "0");
			}else{
				jedis.hset(pollKey, "totalVotes", totalVotesStr);
			}
			jedis.hset(pollKey, "status", poll.status.toString());
			jedis.hset(pollKey, "didNotVote", didNotVoteStr);
			jedis.hset(pollKey, "publishToWeb", poll.publishToWeb.toString());
			jedis.hset(pollKey, "webKey", poll.webKey);
        }
        
        public void setStatus(String pollKey, Boolean status){
        	Jedis jedis = PollApplication.dbConnect();
        	jedis.hset(pollKey, "status", status.toString());
        }
        
        public void vote(String pollKey, Poll poll, Object[] answerIDs, Boolean webVote){
        	Jedis jedis = PollApplication.dbConnect();
        	for (int i = 0; i < answerIDs.length; i++){
	    		// Extract  the index value stored at element i of answerIDs
        		Integer index = Integer.parseInt(answerIDs[i].toString()) + 1;
	    		// Increment the votes for answer
	    		jedis.hincrBy(pollKey, "answer"+index, 1);
        	}
        	if (answerIDs.length > 0){
        		if (!webVote)
        			jedis.hincrBy(pollKey, "didNotVote", -1);
        		jedis.hincrBy(pollKey, "totalVotes", 1);
        	}
        }
}
