package org.bigbluebutton.web.services;

import java.util.Timer;
import java.util.TimerTask;

import org.bigbluebutton.api.MeetingService;

public class ExpiredMeetingCleanupTimerTask {

	private MeetingService service;
	private Timer cleanupTimer;
	
	public ExpiredMeetingCleanupTimerTask() {		}
	
	public void setMeetingService(MeetingService svc) {
		this.service = svc;
	}
	
	public void start() {
		cleanupTimer = new Timer("bbb-api-cleanup", true);
		cleanupTimer.scheduleAtFixedRate(new CleanupTask(), 60000, 300000);				
	}
	
	private class CleanupTask extends TimerTask {
        public void run() {
        	service.removeExpiredMeetings();
        }
    }
}