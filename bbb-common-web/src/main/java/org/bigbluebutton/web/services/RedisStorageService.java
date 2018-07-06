/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.web.services;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.api.domain.Poll;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class RedisStorageService implements IStorageService{
	JedisPool jedisPool;

	private final String SEPARATOR = ":";
	private final String ID_SEED = "nextID";

	/* Meeting Patterns */
	private final String MEETING = "meeting";
	private final String POLL = "poll";
	private final String POLL_ANSWER = "answer";
	private final String POLL_RESULTS = "results";

	/*
meeting:<id>:poll:list [1,2,3] <-- list
meeting:<id>:poll:<pollid> title, date <-- hash
meeting:<id>:poll:<pollid>:answer:list [1,2,3] <-- list
meeting:<id>:poll:<pollid>:answer:<answerid> answertext <-- key/value

meeting:<id>:poll:<pollid>:answer:<answerid>:results [<userid>|1] <-- Set
	*/

	public String generatePollID(String meetingID){
		Jedis jedis = (Jedis) jedisPool.getResource();
		String pattern = getPollRedisPattern(meetingID);
		String pollID = Long.toString(jedis.incr(pattern + SEPARATOR + ID_SEED));
		jedisPool.returnResource(jedis);
		return pollID;
	}

	public String generatePollAnswerID(String meetingID){
		Jedis jedis = jedisPool.getResource();
		String pattern = getPollRedisPattern(meetingID);
		String pollID = Long.toString(jedis.incr(pattern + SEPARATOR + POLL_ANSWER + SEPARATOR + ID_SEED));
		jedisPool.returnResource(jedis);
		return pollID;
	}

	public void storePoll(Poll p){
		Jedis jedis = jedisPool.getResource();
		String pattern = getPollRedisPattern(p.getMeetingID());

		HashMap<String,String> pollMap = p.toMap();
		jedis.hmset(pattern + SEPARATOR + p.getPollID(), pollMap);
		jedisPool.returnResource(jedis);
	}

	public void storePollAnswers(String meetingID, String pollID, Map<String,String> answers){
		Jedis jedis = jedisPool.getResource();
		String pattern = getPollRedisPattern(meetingID);

		//HashMap<String,String> pollMap = p.toMap();
		//jedis.hmset(pattern + SEPARATOR + p.getPollID + SEPARATOR + POLL_ANSWER + SEPARATOR + ID_SEED, pollMap);
		//jedisPool.returnResource(jedis);	
	}

	private String getPollRedisPattern(String meetingID){
		return MEETING + SEPARATOR + meetingID + SEPARATOR + POLL;
	}

	public void setJedisPool(JedisPool jedisPool){
		this.jedisPool = jedisPool;
	}
}