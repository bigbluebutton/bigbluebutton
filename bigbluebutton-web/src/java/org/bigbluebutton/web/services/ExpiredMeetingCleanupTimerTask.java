package org.bigbluebutton.web.services;

import java.util.Timer;
import java.util.TimerTask;

import org.bigbluebutton.api.MeetingService;

public class ExpiredMeetingCleanupTimerTask {

	private final MeetingService service;
	private final Timer cleanupTimer;
	
	public ExpiredMeetingCleanupTimerTask(MeetingService svc) {
		this.service = svc;
		
		cleanupTimer = new Timer("bbb-api-cleanup", true);
		cleanupTimer.scheduleAtFixedRate(new CleanupTask(), 60000, 300000);		
	}
	
	class CleanupTask extends TimerTask {
        public void run() {
        	service.cleanupOldMeetings();
        }
    }
}