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

import org.apache.commons.lang.time.DateFormatUtils;
import org.bigbluebutton.conference.service.poll.PollApplication;
import org.bigbluebutton.conference.service.poll.Poll;
import java.util.ArrayList;

import java.util.List;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;

import org.red5.server.api.Red5;

import redis.clients.jedis.Jedis;


public class PollService {
	
	private static Logger log = Red5LoggerFactory.getLogger( PollService.class, "bigbluebutton" );
	
	private PollApplication application;
	private String LOGNAME = "[PollService]";
	private Poll poll;
	
	public void savePoll(ArrayList clientSidePoll){
	    String pollTime = DateFormatUtils.formatUTC(System.currentTimeMillis(), "MM/dd/yy HH:mm");
	    clientSidePoll.set(6, pollTime);
	    poll = new Poll(clientSidePoll);
	    application.savePoll(poll);
	}
	
	public ArrayList publish(ArrayList clientSidePoll, String pollKey){
		savePoll(clientSidePoll);
		return getPoll(pollKey);
	}
	
	public void setPollApplication(PollApplication a) {
		log.debug(LOGNAME + "Setting Poll Applications");
		application = a;
	}
	
	public ArrayList getPoll(String pollKey)
	{
		Poll poll = application.getPoll(pollKey);
		
		ArrayList values = new ArrayList();
		values.add(poll.title);
		values.add(poll.room);
		values.add(poll.isMultiple);
		values.add(poll.question);
		values.add(poll.answers);
		values.add(poll.votes);
		values.add(poll.time);	
		values.add(poll.totalVotes);
		values.add(poll.status);
		values.add(poll.didNotVote);
		values.add(poll.publishToWeb);
		values.add(poll.webKey);
		return values;
	}
	
	public ArrayList vote(String pollKey, ArrayList answerIDs, Boolean webVote)
	{
		application.vote(pollKey, answerIDs.toArray(), webVote);
		return getPoll(pollKey);
	}
	
	public ArrayList titleList()
	{
		return application.titleList();
	}
	
	public void setStatus(String pollKey, Boolean status){
		application.setStatus(pollKey, status);
	}
	
	public ArrayList generate(String pollKey){
		ArrayList webInfo = new ArrayList();
		webInfo = application.generate(pollKey);
		return webInfo;
	}
	
	public void cutOffWebPoll(String pollKey){
		application.cutOffWebPoll(pollKey);
	}
}
