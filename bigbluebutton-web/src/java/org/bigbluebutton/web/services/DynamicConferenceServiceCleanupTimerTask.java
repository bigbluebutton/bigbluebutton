package org.bigbluebutton.web.services;

import java.util.TimerTask;

public class DynamicConferenceServiceCleanupTimerTask extends TimerTask {

	private final DynamicConferenceService service;
	
	public DynamicConferenceServiceCleanupTimerTask(DynamicConferenceService svc) {
		this.service = svc;
	}
	
	@Override
	public void run() {
		service.cleanupOldConferences();
	}

}
