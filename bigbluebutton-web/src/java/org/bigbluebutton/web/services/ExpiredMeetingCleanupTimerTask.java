package org.bigbluebutton.web.services;

import java.util.Timer;
import java.util.TimerTask;

import org.bigbluebutton.api.MeetingService;

public class ExpiredMeetingCleanupTimerTask {

	private MeetingService service;
	private Timer cleanupTimer;
	private long runEvery = 60000;

	public void setMeetingService(MeetingService svc) {
		this.service = svc;
	}
	
	public void start() {
		cleanupTimer = new Timer("bbb-api-cleanup", true);
		cleanupTimer.scheduleAtFixedRate(new CleanupTask(), 60000, runEvery);				
	}
	
	public void setRunEvery(long v) {
		runEvery = v;
	}
	
	private class CleanupTask extends TimerTask {
        public void run() {
        	service.removeExpiredMeetings();
        }
    }
}