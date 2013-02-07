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

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

import net.jcip.annotations.ThreadSafe;
import java.util.concurrent.ConcurrentHashMap;
import java.util.ArrayList;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@ThreadSafe
public class Poll{
	
	// Poll URL http://142.204.133.24/bigbluebutton/polls.jsp?poll={webKey}
	
	/* KEY PLACES TO UPDATE, WHEN ADDING NEW FIELDS TO THE HASH:
	 * PollService.java, getPoll()
	 * PollInvoker.java, invoke()
	 * PollRecorder.java, record()
	 * Don't forget the client side as well (key locations found in PollObject.as)
	 */
	
	private static Logger log = Red5LoggerFactory.getLogger( Poll.class, "bigbluebutton" );
	
	private String LOGNAME = "[Poll]";
	
	// IMPORTANT: For every field you add to the hash, add one to the value of otherFields.
	// The value MUST always reflect how many fields are in the hash, except for answers and votes.
	
	private static int otherFields = 10;
	
	public final String title;			//  1
	public final String room;			//  2
	public final Boolean isMultiple;	//  3
	public final String question;		//  4
	public ArrayList <String> answers;	// --
	public ArrayList <Integer> votes;	// --
	public String time;					//  5
	public int totalVotes;				//  6
	public Boolean status;				//  7
	public int didNotVote;				//  8
	public Boolean publishToWeb;		//  9
	public String webKey;				// 10
	
	@SuppressWarnings("unchecked")
	public Poll (ArrayList otherPoll){
		title 			= otherPoll.get(0).toString();
		room 			= otherPoll.get(1).toString();
		isMultiple 		= (Boolean)otherPoll.get(2);
		question 		= otherPoll.get(3).toString();
		answers 		= (ArrayList)otherPoll.get(4);
		votes 			= (ArrayList)otherPoll.get(5);
		time 			= otherPoll.get(6).toString();
		totalVotes 		= Integer.parseInt(otherPoll.get(7).toString());
		status 			= (Boolean)otherPoll.get(8);
		didNotVote	 	= Integer.parseInt(otherPoll.get(9).toString());
		publishToWeb 	= (Boolean)otherPoll.get(10);
		if (publishToWeb && webKey != null){
			webKey		= otherPoll.get(11).toString();
		}
		else{
			webKey		= "";
		}
	}

	public String getRoom() {
		return room;
	}
	
	public void checkObject(){
		// This just loops through the Poll and does a bunch of log.debug messages to verify the contents.
		if (this != null){
			log.debug(LOGNAME + "Running CheckObject on the poll with title " + title);
			log.debug(LOGNAME + "Room is: " + room);
			log.debug(LOGNAME + "isMultiple is: " + isMultiple.toString());
			log.debug(LOGNAME + "Question is: " + question);
			log.debug(LOGNAME + "Answers are: " + answers);
			log.debug(LOGNAME + "Votes are: " + votes);
			log.debug(LOGNAME + "Time is: " + time);
			log.debug(LOGNAME + "TotalVotes is: " + totalVotes);
			log.debug(LOGNAME + "Status is: " + status.toString());
			log.debug(LOGNAME + "DidNotVote is: " + didNotVote);
			log.debug(LOGNAME + "PublishToWeb is: " + publishToWeb.toString());
			log.debug(LOGNAME + "WebKey is: " + webKey);
		}else{
			log.error(LOGNAME + "This Poll is NULL.");
		}
	}
	
	public static int getOtherFields(){
		return otherFields;
	}
}
