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

import org.bigbluebutton.api.messaging.MessagingService;
import org.bigbluebutton.api.messaging.MessagingConstants;

import java.util.Timer;
import java.util.TimerTask;
import java.util.ArrayList;
import java.util.HashMap;

import com.google.gson.Gson;

public class KeepAliveService {

	private final String KEEP_ALIVE_MESSAGE = "KEEP_ALIVE_MESSAGE";
	private MessagingService service;
	private Timer cleanupTimer;
	private long runEvery = 5000;
	private int maxLives = 5;
	private KeepAliveTask task = null;

	/*public void setMeetingService(MeetingService svc) {
		this.service = svc;
	}*/
	
	public void start() {
		cleanupTimer = new Timer("keep-alive-task", true);

		task = new KeepAliveTask();
		cleanupTimer.scheduleAtFixedRate(task, 5000, runEvery);
	}
	
	public void setRunEvery(long v) {
		runEvery = v;
	}
	
	class KeepAliveTask extends TimerTask {

		ArrayList liveMsgs;

		KeepAliveTask(){
			liveMsgs = new ArrayList();
		}

        public void run() {
        	String aliveId = Long.toString(System.currentTimeMillis());

        	HashMap<String,String> map = new HashMap<String,String>();
        	map.put("messageId", KEEP_ALIVE_MESSAGE);
        	map.put("aliveId", aliveId);

        	Gson gson = new Gson();

        	service.send(MessagingConstants.SYSTEM_CHANNEL, gson.toJson(map));

        	liveMsgs.add(aliveId);
        }

        public void checkAliveId(String id){
        	int count = 0;
        	while(count < liveMsgs.size()){
        		if(liveMsgs.get(count) == id)
        			liveMsgs.remove(count);
        		count++;
        	}
        }


    }

    public void handleMessage(String aliveId){
    	if(task != null){
    		task.checkAliveId(aliveId);		
    	}
    }
}