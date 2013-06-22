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
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.red5.logging.Red5LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class PollService {	
	private static Logger log = Red5LoggerFactory.getLogger( PollService.class, "bigbluebutton" );
	
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW inGW) {
		bbbInGW = inGW;
	}
	
	public void createPoll(String msg){
		System.out.println("*** PollService:: create poll \n" + msg + "\n");

	}

	public void updatePoll(String msg){
		System.out.println("*** PollService:: update poll \n" + msg + "\n");

	}
	
	public void startPoll(String msg){
		System.out.println("*** PollService:: start poll \n" + msg + "\n");

	}
	
	public void stopPoll(String msg){
		System.out.println("*** PollService:: stop poll \n" + msg + "\n");

	}
	
	public void removePoll(String msg){
		System.out.println("*** PollService:: remove poll \n" + msg + "\n");

	}
	
	public void respondPoll(String msg){
		System.out.println("*** PollService:: respond poll \n" + msg + "\n");

	}
}
